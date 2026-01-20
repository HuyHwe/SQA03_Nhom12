package com.paymentservice.model.projection;

import java.time.LocalDateTime;

public interface WalletProjection {
    Long getId();
    String getNote();
    String getStatus();
    String getActionName();
    Double getTotalMoney();
    Double getTotalPoint();
    Double getReceiveMoney();
    Integer getTransferType();
    String getBankAccount();
    Long getConversionRate();
    Double getTransferredPoint();
    Double getTransferredMoney();
    LocalDateTime getCreationDate();
    LocalDateTime getUpdateDate();
}
