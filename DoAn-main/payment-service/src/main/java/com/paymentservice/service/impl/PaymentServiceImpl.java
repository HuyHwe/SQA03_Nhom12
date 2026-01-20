package com.paymentservice.service.impl;
import com.amazonaws.services.alexaforbusiness.model.UnauthorizedException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.jober.utilsservice.utils.HttpUtils;
import com.paymentservice.config.EnvProperties;
import com.paymentservice.model.TransactionHistory;
import com.paymentservice.model.vnpay.RefundRes;
import com.paymentservice.repository.TrxHisRepo;
import com.paymentservice.service.TransactionHistoryService;
import com.paymentservice.utilsmodule.constant.APIConstant;
import com.paymentservice.utilsmodule.constant.Constant;
import com.paymentservice.utilsmodule.constant.PaymentConfig;
import com.paymentservice.dto.PaymentReqDTO;
import com.paymentservice.dto.PaymentResDTO;
import com.paymentservice.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

import static com.jober.utilsservice.constant.Constant.OBJECT_MAPPER;
import static com.jober.utilsservice.constant.ConstantFields.PHONE;
import static com.paymentservice.utilsmodule.constant.Constant.*;


@Service
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    @Autowired
    private EnvProperties envProperties;
    @Autowired
    private TransactionHistoryService transactionHistoryService;
    @Autowired
    private TrxHisRepo trxHisRepo;
    @Autowired
    private CommunityService communityService;

    @Override
    public PaymentResDTO createPayment(PaymentReqDTO paymentReqDTO) throws UnsupportedEncodingException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String phone = auth.getName();

        Long userId = communityService.getUserId(phone);
        if (userId == null) {
            log.error("User not found");
            throw new UnauthorizedException("User not found");
        }

        final String vnp_Version = "2.1.0";
        final String vnp_Command = "pay";
        final String orderType   = "other";

        // amount = VND * 100 -> số nguyên
        BigDecimal amount100 = paymentReqDTO.getAmount()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP);

        String vnp_TxnRef  = PaymentConfig.getRandomNumber(8);
        String vnp_IpAddr  = Optional.ofNullable(PaymentConfig.getIpAddress()).orElse("0.0.0.0");
        String vnp_TmnCode = PaymentConfig.vnp_TmnCode;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put(Constant.vnp_Version,   vnp_Version);
        vnp_Params.put(Constant.vnp_Command,   vnp_Command);
        vnp_Params.put(Constant.vnp_TmnCode,   vnp_TmnCode);
        vnp_Params.put(Constant.vnp_Amount,    amount100.toPlainString()); // VD: "10000000"
        vnp_Params.put(Constant.vnp_CurrCode,  "VND");                      // ✅ currency cố định

        // ✅ KHÔNG set vnp_BankCode (đã bỏ theo yêu cầu)

        vnp_Params.put(Constant.vnp_TxnRef,    vnp_TxnRef);
        vnp_Params.put(Constant.vnp_OrderInfo, "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put(Constant.vnp_OrderType, orderType);

        // locale chỉ "vn" hoặc "en" (mặc định "vn")
        String locale = Optional.ofNullable(paymentReqDTO.getLanguage())
                .map(String::trim)
                .filter(s -> s.equalsIgnoreCase("vn") || s.equalsIgnoreCase("en"))
                .orElse("vn");
        vnp_Params.put(Constant.vnp_Locale, locale);

        String vnp_ReturnUrl = envProperties.getPaymentServiceURI() + PaymentConfig.vnp_ReturnUrl;
        vnp_Params.put(Constant.vnp_ReturnUrl, vnp_ReturnUrl + "?phone=" + phone); // (nếu chưa muốn bỏ phone)
        vnp_Params.put(Constant.vnp_IpAddr,    vnp_IpAddr);

        // Thời gian theo Asia/Ho_Chi_Minh
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put(Constant.vnp_CreateDate, vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put(Constant.vnp_ExpireDate, vnp_ExpireDate);

        // Ký & build URL
        List fieldNames = new ArrayList(vnp_Params.keySet());
        StringBuilder query = new StringBuilder();
        log.info("vnp_TxnRef: {} vnp_CreateDate: {}", vnp_Params.get(Constant.vnp_TxnRef), vnp_Params.get(Constant.vnp_CreateDate));

        String hashData = PaymentConfig.vnp_SecureHash(fieldNames, vnp_Params, query);
        String queryUrl = query.toString();
        String vnp_SecureHash = PaymentConfig.hmacSHA512(PaymentConfig.vnp_HashSecret, hashData);
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        String paymentUrl = PaymentConfig.vnp_PayUrl + "?" + queryUrl;

        return PaymentResDTO.builder()
                .data(paymentUrl)
                .message("success")
                .code("00")
                .build();
    }

    /**
     * Đây là địa chỉ để nhận kết quả thanh toán từ VNPAY. Kết nối hiện tại sử dụng phương thức GET: vnp_IPNUrl
     */
    @Override
    @Transactional
    public void paymentCallback(Map<String, String> queryParams, HttpServletResponse response) throws Exception {
        String vnp_ResponseCode = queryParams.get(Constant.vnp_ResponseCode);
        String phone = queryParams.get(PHONE);
        BigDecimal price = new BigDecimal(queryParams.get(vnp_Amount));
        price = price.divide(new BigDecimal(10));

        if (phone!= null && !phone.equals("")) {
            if (SUCCESSFUL_TRANSACTION.equals(vnp_ResponseCode)) {
                Long userId = communityService.getUserId(phone);
                TransactionHistory transactionHistory = TransactionHistory
                        .builder()
                        .userId(userId)
                        .transferredMoney(price)
                        .creationDate(LocalDateTime.now())
                        .updateDate(LocalDateTime.now())
                        .build();
                trxHisRepo.save(transactionHistory);
                response.sendRedirect(envProperties.getFE_DOMAIN() + APIConstant.FE_CANDIDATE_REFERRAL_PROGRAM);
            } else {
                // failed
                response.sendRedirect(envProperties.getFE_DOMAIN() + APIConstant.FE_PAYMENT_FAILED);
            }
        } else {
            response.sendRedirect(envProperties.getFE_DOMAIN() + APIConstant.FE_PAYMENT_FAILED);
        }
    }

    private static void buildVnpParams(Map<String, String> vnp_Params, BigDecimal amount, String vnp_Command, List<String> fieldNames) {
        String vnp_Version = "2.1.0";
        String vnp_TransactionType = "02";
        amount = amount.multiply(BigDecimal.valueOf(100));
//        vnp_TxnRef: Mã tham chiếu của giao dịch tại hệ thống của merchant. Mã này do merchant gửi sang khi yêu cầu thanh toán. VNPAY gửi lại để merchant cập nhật
        String vnp_TxnRef = "30888597";
//        String vnp_TxnRef = PaymentConfig.getRandomNumber(8);
//        todo test
//        String vnp_IpAddr = "::1";
        String vnp_IpAddr = PaymentConfig.getIpAddress();
        String vnp_TmnCode = PaymentConfig.vnp_TmnCode;

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());

        vnp_Params.put(Constant.vnp_RequestId, vnp_CreateDate);
        vnp_Params.put(Constant.vnp_Version, vnp_Version);
        vnp_Params.put(Constant.vnp_Command, vnp_Command);
        vnp_Params.put(Constant.vnp_TmnCode, vnp_TmnCode);
        vnp_Params.put(Constant.vnp_TxnRef, vnp_TxnRef);
        vnp_Params.put(Constant.vnp_OrderInfo, "Refund:" + vnp_TxnRef);
        vnp_Params.put(Constant.vnp_TransactionDate, vnp_CreateDate);
        vnp_Params.put(Constant.vnp_CreateDate, vnp_CreateDate);
        vnp_Params.put(Constant.vnp_IpAddr, vnp_IpAddr);

        if (vnp_Command.equals(REFUND)) {
            vnp_Params.put(Constant.vnp_Amount, String.valueOf(amount));
            vnp_Params.put(Constant.vnp_CreateBy, "VNPAY-TEST");
            vnp_Params.put(Constant.vnp_TransactionType, vnp_TransactionType);
        }
        String hashData = null;
        try {
            hashData = PaymentConfig.vnp_SecureHash(fieldNames, vnp_Params);
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
        String vnp_SecureHash = PaymentConfig.hmacSHA512(PaymentConfig.vnp_HashSecret, hashData.toString());
        vnp_Params.put(Constant.vnp_SecureHash, vnp_SecureHash);
    }

    @Override
    public RefundRes refund(PaymentReqDTO paymentReqDTO) {
        Map<String, String> vnp_Params = new HashMap<>();
        String vnp_Command = paymentReqDTO.getVnp_Command();
        List fieldNames = null;
        if (vnp_Command.equals(REFUND)) {
            fieldNames = Arrays.asList(Constant.vnp_RequestId, Constant.vnp_Version,
                    Constant.vnp_Command, Constant.vnp_TmnCode,
                    Constant.vnp_TransactionType, Constant.vnp_TxnRef, Constant.vnp_Amount, Constant.vnp_TransactionNo,
                    Constant.vnp_TransactionDate, Constant.vnp_CreateBy, Constant.vnp_CreateDate,
                    Constant.vnp_IpAddr, Constant.vnp_OrderInfo);
        } else if (vnp_Command.equals(QUERY_DR)) {
            fieldNames = Arrays.asList(Constant.vnp_RequestId, Constant.vnp_Version,
                    Constant.vnp_Command, Constant.vnp_TmnCode,
                    Constant.vnp_TxnRef, Constant.vnp_TransactionDate, Constant.vnp_CreateDate,
                    Constant.vnp_IpAddr, Constant.vnp_OrderInfo);
        }
        buildVnpParams(vnp_Params, paymentReqDTO.getAmount(), vnp_Command, fieldNames);

        HttpUtils httpUtils = new HttpUtils();
        ResponseEntity response = httpUtils.postData(vnp_Params, null, PaymentConfig.vnp_RefundUrl);
        if (response == null || response.getBody() == null || response.getBody().toString().isEmpty()) return null;
        try {
            RefundRes refundRes = OBJECT_MAPPER.readValue(response.getBody().toString(), RefundRes.class);
            return refundRes;
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public static void main(String[] args) throws UnsupportedEncodingException {
        PaymentReqDTO paymentReqDTO = PaymentReqDTO.builder()
                .amount(new BigDecimal(15000))
                .language("vnd")
                .bankCode("NCB")
                .build();
        PaymentService paymentService = new PaymentServiceImpl();
        paymentService.createPayment(paymentReqDTO);

    }
}
