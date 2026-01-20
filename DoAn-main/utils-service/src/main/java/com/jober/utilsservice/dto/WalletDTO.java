package com.jober.utilsservice.dto;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class WalletDTO {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("userPhone")
    private String userPhone;

    @JsonProperty("userId")
    private Long userId;

    @JsonProperty("totalMoney")
    private Long totalMoney;

    @JsonProperty("totalPoint")
    private BigDecimal totalPoint;

    @JsonProperty("addingPoint")
    private BigDecimal addingPoint;

    @JsonProperty("bankAccount")
    private String bankAccount;

    @JsonProperty("creationDate")
    private LocalDateTime creationDate;

    private boolean isChanged;

}
