package com.paymentservice.utilsmodule.constant;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum PaymentStatus {

    @JsonProperty("success")
    SUCCESS,

    @JsonProperty("failed")
    FAILED,

    @JsonProperty("processing")
    PROCESSING,

    @JsonProperty("canceled")
    CANCELED,

    @JsonProperty("expired")
    EXPIRED

}
