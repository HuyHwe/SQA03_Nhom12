package com.paymentservice.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PaymentReqDTO {
    private BigDecimal amount;
    private String bankCode;
    private String phone;
    private String language;
    private String currency;
    private String vnp_Command;
}
