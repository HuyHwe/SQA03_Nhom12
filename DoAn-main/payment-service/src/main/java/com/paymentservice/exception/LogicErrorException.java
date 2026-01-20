package com.paymentservice.exception;

import com.paymentservice.dto.response.ErrorResponse;

import java.util.ArrayList;
import java.util.List;

public class LogicErrorException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private List<ErrorResponse> errorList;

    public LogicErrorException() {
        super();
    }

    public LogicErrorException(String message, String errorCode) {
        this.errorList = new ArrayList<>();
        ErrorResponse error = new ErrorResponse();
        error.setMessage(message);
        error.setErrorCode(errorCode);
        this.errorList.add(error);
    }

    public LogicErrorException(String field, String message, String errorCode) {
        this.errorList = new ArrayList<>();
        this.errorList.add(new ErrorResponse(field, message, errorCode));
    }

    public LogicErrorException(List<ErrorResponse> errorList) {
        this.errorList = errorList;
    }

    public List<ErrorResponse> getErrorList() {
        return errorList;
    }

    public void setErrorList(List<ErrorResponse> errorList) {
        this.errorList = errorList;
    }
}
