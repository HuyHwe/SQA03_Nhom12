package com.paymentservice.dto.response;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Setter
@Getter
//@SuperBuilder
public class WalletResponse {
    private Long id;
    private String note;
    private String status;
    private String actionName;
    private Double totalMoney;
    private Double totalPoint;
    private Double receiveMoney;
    private Integer transferType;
    private String bankAccount;
    private Long conversionRate;
    private Double transferredPoint;
    private Double transferredMoney;
    private LocalDateTime creationDate;
    private LocalDateTime updateDate;
}
