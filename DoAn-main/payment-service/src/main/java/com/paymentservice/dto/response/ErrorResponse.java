package com.paymentservice.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

@JsonInclude(Include.NON_NULL)
public class ErrorResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("field")
    @JsonInclude(Include.NON_NULL)
    private String field;
    @JsonProperty("message")
    private String message;
    @JsonProperty("errorCode")
    private String errorCode;

    public ErrorResponse() {
    }

    public ErrorResponse(String field, String message, String errorCode) {
        this.field = field;
        this.message = message;
        this.errorCode = errorCode;
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
}
