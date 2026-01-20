package com.resourceservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResDTO {
    private String code;

    private String message;

    private String data;
}
