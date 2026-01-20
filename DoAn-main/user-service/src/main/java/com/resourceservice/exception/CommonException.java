package com.resourceservice.exception;

import org.springframework.http.HttpStatus;

public class CommonException extends RuntimeException {

    private static final long serialVersionUID = 5269283481236191340L;

    private String message;
    private HttpStatus httpStatus;
    private String errorCode;

    public CommonException(String message, HttpStatus httpStatus, String errorCode) {
        this.message = message;
        this.httpStatus = httpStatus;
        this.errorCode = errorCode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public void setHttpStatus(HttpStatus httpStatus) {
        this.httpStatus = httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
}
