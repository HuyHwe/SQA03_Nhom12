package com.configurationservice.exception;

public class InvalidParameterException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private String field;
    private String message;
    private String errorCode;

    public InvalidParameterException() {
        super();
    }

    public InvalidParameterException(String field, String message, String errorCode) {
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
