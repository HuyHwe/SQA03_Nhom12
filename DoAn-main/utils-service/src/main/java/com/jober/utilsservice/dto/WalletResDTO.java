package com.jober.utilsservice.dto;
import com.fasterxml.jackson.annotation.JsonProperty;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WalletResDTO {
    @JsonProperty("id")
    private Long id;

    @JsonProperty("totalMoney")
    private Long totalMoney;

    @JsonProperty("totalPoint")
    private BigDecimal totalPoint;

    @JsonProperty("bankAccount")
    private String bankAccount;

    @JsonProperty("userId")
    private Long userId;

    @JsonProperty("creationDate")
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime creationDate;

}
