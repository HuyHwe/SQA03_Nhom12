package com.paymentservice.dto.request.momo;


import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CreatePaymentMomoRequest {

    private String partnerCode;

    private String requestId;

    private Long amount;

    private String orderId;

    private String orderInfo;

    private String redirectUrl;

    private String ipnUrl;

    private String requestType;

    private String lang;

    private String extraData;

    private String signature;

}
