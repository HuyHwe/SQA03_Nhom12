package com.paymentservice.dto.request.momo;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CreatePaymentMomoResponse {

    private String partnerCode;

    private String requestId;

    private String orderId;

    private Long amount;

    private Long responseTime;

    private String languange;

    private String message;

    private int resultCode;

    private String payUrl;

}
