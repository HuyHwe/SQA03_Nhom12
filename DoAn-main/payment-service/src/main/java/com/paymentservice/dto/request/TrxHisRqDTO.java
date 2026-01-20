package com.paymentservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TrxHisRqDTO {
    private Long id;

    private String userPhone;

    private BigDecimal conversionRate;

    private BigDecimal transferredMoney;

    private BigDecimal transferredPoint;
    private String otherReason;
    private String note;
    private Integer transferType;
}
