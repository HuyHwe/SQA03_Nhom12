package com.paymentservice.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WalletExternalDTO {
    @JsonProperty("price")
    private BigDecimal price;
}
