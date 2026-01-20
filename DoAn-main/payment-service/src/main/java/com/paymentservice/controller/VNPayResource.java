package com.paymentservice.controller;

import com.paymentservice.config.EnvProperties;
import com.paymentservice.dto.PaymentReqDTO;
import com.paymentservice.dto.PaymentResDTO;
import com.paymentservice.model.vnpay.RefundRes;
import com.paymentservice.service.PaymentService;
import com.paymentservice.service.TransactionHistoryService;
import com.paymentservice.service.WalletService;
import com.paymentservice.utilsmodule.constant.Constant;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import javax.websocket.server.PathParam;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/vnpay")
@RequiredArgsConstructor
public class VNPayResource {
    @Autowired
    private EnvProperties envProperties;
    @Autowired
    private TransactionHistoryService transactionHistoryService;
    @Autowired
    private WalletService walletService;
    private final PaymentService paymentService;

    @GetMapping("/payment-callback")
    public void paymentCallback(@RequestParam Map<String, String> queryParams, HttpServletResponse response) throws IOException {
        try {
            paymentService.paymentCallback(queryParams, response);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        /*String vnp_ResponseCode = queryParams.get("vnp_ResponseCode");
        String phone = queryParams.get(PHONE);
        if(phone!= null && !phone.equals("")) {
            if ("00".equals(vnp_ResponseCode)) {
                // Giao dịch thành công
                // Thực hiện các xử lý cần thiết, ví dụ: cập nhật CSDL
                *//*Contract contract = contractRepository.findById(Integer.parseInt(queryParams.get("contractId")))
                .orElseThrow(() -> new NotFoundException("Không tồn tại hợp đồng này của sinh viên"));
            contract.setStatus(1);
            contractRepository.save(contract);*//*
                *//*PaymentInfo paymentInfo = OBJECT_MAPPER.readValue(info, PaymentInfo.class);
                TrxHisRqDTO trxHisRqDTO = paymentInfo.getTrxHisRqDTO();
                transactionHistoryService.save(trxHisRqDTO);*//*

                response.sendRedirect(envProperties.getFE_URI() + APIConstant.FE_CANDIDATE_PROFILE);
            } else {
                // failed
                response.sendRedirect("http://localhost:4200/payment-failed");
            }
        } else {
            response.sendRedirect("http://localhost:4200/payment-failed");
        }*/
    }
    @GetMapping("/pay")
	public String getPay(@PathParam("price") long price, @PathParam("phone") Integer phone) throws UnsupportedEncodingException{
		
		String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        long amount = price*100;
        String bankCode = "NCB";
        
        String vnp_TxnRef = Config.getRandomNumber(8);
        String vnp_IpAddr = "127.0.0.1";

        String vnp_TmnCode = Config.vnp_TmnCode;
        
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        
        vnp_Params.put("vnp_BankCode", bankCode);
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);

        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", Config.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        
        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                //Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = Config.hmacSHA512(Config.secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = Config.vnp_PayUrl + "?" + queryUrl;
		
		return paymentUrl;
	}

    @PostMapping("/create-payment")
    public ResponseEntity<PaymentResDTO> getPayService(@RequestBody PaymentReqDTO paymentReqDTO) throws UnsupportedEncodingException{
        return ResponseEntity.ok(paymentService.createPayment(paymentReqDTO));
	}
    @PostMapping("/refund")
    public ResponseEntity<RefundRes> refund(@RequestBody PaymentReqDTO paymentReqDTO) throws UnsupportedEncodingException {
        paymentReqDTO.setVnp_Command(Constant.REFUND);
        return ResponseEntity.ok(paymentService.refund(paymentReqDTO));
    }
    @PostMapping("/payment-result")
    public ResponseEntity<RefundRes> getPayRes(@RequestBody PaymentReqDTO paymentReqDTO) throws UnsupportedEncodingException {
        paymentReqDTO.setVnp_Command(Constant.QUERY_DR);
        return ResponseEntity.ok(paymentService.refund(paymentReqDTO));
    }
}
