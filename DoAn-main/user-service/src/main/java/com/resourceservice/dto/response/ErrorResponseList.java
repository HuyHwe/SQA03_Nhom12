package com.resourceservice.dto.response;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class ErrorResponseList implements Serializable {

    private static final long serialVersionUID = 1L;

    private List<ErrorResponse> errorList;

    public ErrorResponseList() {
        errorList = new ArrayList<>();
    }

    public ErrorResponseList(List<ErrorResponse> errorList) {
        this.errorList = errorList;
    }

    public List<ErrorResponse> getErrorList() {
        return errorList;
    }

    public void setErrorList(List<ErrorResponse> errorList) {
        this.errorList = errorList;
    }
}
