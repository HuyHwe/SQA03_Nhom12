package com.paymentservice.service.impl;

import com.paymentservice.connect.Momo;
import com.paymentservice.dto.request.MomoIpnRequest;
import com.paymentservice.dto.request.momo.CreatePaymentMomoRequest;
import com.paymentservice.dto.request.momo.CreatePaymentMomoResponse;
import com.paymentservice.model.TransactionHistory;
import com.paymentservice.model.UserCommon;
import com.paymentservice.model.Payment;
import com.paymentservice.model.Wallet;
import com.paymentservice.repository.PaymentRepo;
import com.paymentservice.repository.TrxHisRepo;
import com.paymentservice.repository.UserCommonRepo;
import com.paymentservice.repository.WalletRepo;
import com.paymentservice.service.MomoService;
import com.paymentservice.utilsmodule.constant.PaymentStatus;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MomoServiceImpl implements MomoService {

    @Value("${MOMO_PARTNER_CODE}")
    private String PARTNER_CODE;

    @Value("${MOMO_ACCESS_KEY}")
    private String ACCESS_KEY;

    @Value("${MOMO_SECRET_KEY}")
    private String SECRET_KEY;

    @Value("${MOMO_REQUEST_TYPE}")
    private String REQUEST_TYPE;

    @Value("${MOMO_REDIRECT_URL}")
    private String REDIRECT_URL;

    @Value("${MOMO_IPN_URL}")
    private String IPN_URL;

    private final UserCommonRepo userCommonRepo;

    private final PaymentRepo paymentRepo;

    private final WalletRepo walletRepo;

    private final Momo momoApi;

    private final TrxHisRepo trxHisRepo;

    @Transactional
    @Override
    public CreatePaymentMomoResponse createQR(CreatePaymentMomoRequest dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        try {
            String username = auth.getName();
            String orderId   = UUID.randomUUID().toString();
            String requestId = UUID.randomUUID().toString();
            String orderInfo = "Payment for " + orderId;

            UserCommon user = (UserCommon) userCommonRepo.findByPhone(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            String extraJson = "{\"note\":\"no voucher\"}";
            String extraData = Base64.getEncoder().encodeToString(extraJson.getBytes(StandardCharsets.UTF_8));

            String rawSignature =
                    "accessKey="   + ACCESS_KEY +
                            "&amount="     + dto.getAmount() +
                            "&extraData="  + extraData +
                            "&ipnUrl="     + IPN_URL +
                            "&orderId="    + orderId +
                            "&orderInfo="  + orderInfo +
                            "&partnerCode="+ PARTNER_CODE +
                            "&redirectUrl="+ REDIRECT_URL +
                            "&requestId="  + requestId +
                            "&requestType="+ REQUEST_TYPE;

            String signature;
            try {
                signature = signHmacSHA256(rawSignature, SECRET_KEY);
            } catch (Exception e) {
                throw new RuntimeException("Failed to sign request", e);
            }


            // Save transaction to database
            Payment payment = Payment.builder()
                    .userCommon(user)
                    .totalMoney(dto.getAmount())
                    .status(PaymentStatus.PROCESSING)
                    .note(orderInfo)
                    .orderId(orderId)
                    .active(1)
                    .build();

            paymentRepo.save(payment);


            CreatePaymentMomoRequest request = CreatePaymentMomoRequest.builder()
                    .partnerCode(PARTNER_CODE)
                    .requestType(REQUEST_TYPE)
                    .ipnUrl(IPN_URL)
                    .redirectUrl(REDIRECT_URL)
                    .orderId(orderId)
                    .amount(dto.getAmount())
                    .orderInfo(orderInfo)
                    .requestId(requestId)
                    .extraData(extraData)
                    .signature(signature)
                    .lang("vi")
                    .build();

            return momoApi.createMomoQR(request);
        }catch (FeignException.Unauthorized e) {
            log.error("Unauthorized access: " + e.getMessage());
            throw e;
        } catch (Throwable e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public boolean ipnHanlder(MomoIpnRequest request) {
        try {
            if(!verifySignature(request,ACCESS_KEY,SECRET_KEY)) {
                log.error("Invalid signature");
                return false;
            }
            String orderId = request.getOrderId();

            Payment payment = (Payment) paymentRepo.findByOrderId(orderId).orElseThrow(() -> new RuntimeException("Payment not found: " + orderId));

            Long userId = payment.getUserCommon().getId();

            Wallet wallet = (Wallet) walletRepo.findByUserId(userId).orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));

            switch (request.getResultCode()) {
                case 0:
                    updatePaymentForSuccess(payment, request);
                    updateWalletForSuccess(wallet, request);

                    TransactionHistory history = createTransactionHistory(userId, request);
                    trxHisRepo.save(history);
                    break;

                case 1006:
                    payment.setStatus(PaymentStatus.CANCELED);
                    payment.setNote(request.getMessage());
                    break;

                case 1003:
                    payment.setStatus(PaymentStatus.EXPIRED);
                    payment.setNote(request.getMessage());
                    break;

                default:
                    payment.setStatus(PaymentStatus.FAILED);
                    payment.setNote(request.getMessage());
                    break;
            }

            paymentRepo.save(payment);

            walletRepo.save(wallet);

            log.info("Payment {} updated to {}", request.getOrderId(), payment.getStatus());
            return true;

        }catch(Exception e) {
            log.error("IPN Handler error: ", e);
            return false;
        } catch (Throwable e) {
            throw new RuntimeException(e);
        }
    }

    private void updatePaymentForSuccess(Payment payment, MomoIpnRequest request) {
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setNote(request.getMessage());
    }

    private void updateWalletForSuccess(Wallet wallet, MomoIpnRequest request) {
        Long currentBalance = wallet.getTotalMoney();
        Long amount =request.getAmount();

        if(wallet.getTotalMoney() == null) {
            wallet.setTotalMoney(0L);
        }

        Long newBalance = currentBalance + amount;
        wallet.setTotalMoney(newBalance);

        Long point = transferToPoint(request.getAmount());

        if(wallet.getTotalPoint() == null) {
            wallet.setTotalPoint(BigDecimal.ZERO);
        } else {
            wallet.setTotalPoint(wallet.getTotalPoint().add(new BigDecimal(point)));
        }
    }

    private TransactionHistory createTransactionHistory(Long userId, MomoIpnRequest request) {
        return TransactionHistory.builder()
                .userId(userId)
                .transferredMoney(new BigDecimal(request.getAmount()))
                .transferredPoint(new BigDecimal(transferToPoint(request.getAmount())))
                .note("Nạp tiền qua MoMo QR")
                .active(1)
                .build();
    }

    private Long transferToPoint(Long amount) {
        return amount / 1000;
    }

    private String signHmacSHA256(String data, String key) throws Exception {
        Mac hmacSHA256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmacSHA256.init(secretKey);
        byte[] hash = hmacSHA256.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    private boolean verifySignature(MomoIpnRequest r, String accessKey, String secretKey) {
        try {
            String raw = "accessKey=" + accessKey
                    + "&amount=" + r.getAmount()
                    + "&extraData=" + nvl(r.getExtraData())
                    + "&message=" + nvl(r.getMessage())
                    + "&orderId=" + r.getOrderId()
                    + "&orderInfo=" + nvl(r.getOrderInfo())
                    + "&orderType=" + nvl(r.getOrderType())
                    + "&partnerCode=" + r.getPartnerCode()
                    + "&payType=" + nvl(r.getPayType())
                    + "&requestId=" + r.getRequestId()
                    + "&responseTime=" + r.getResponseTime()
                    + "&resultCode=" + r.getResultCode()
                    + "&transId=" + r.getTransId();

            String signature = signHmacSHA256(raw, secretKey);
            return signature.equals(r.getSignature());
        } catch(Exception e) {
            return false;
        }
    }

    private String nvl(String s) { return s == null ? "" : s; }

    private String getOrderId(String orderInfo) {
       if(StringUtils.isBlank(orderInfo) || StringUtils.isEmpty(orderInfo)) {
           throw new RuntimeException("Invalid orderInfo");
       }

       try {
           int lastSpaceIndex = orderInfo.lastIndexOf(" ");
           String orderId = orderInfo.substring(lastSpaceIndex + 1);
           return orderId;
       } catch(Exception e) {
              throw new RuntimeException("Invalid orderInfo");
       }
    }

}
