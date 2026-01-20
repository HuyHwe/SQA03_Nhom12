package com.jober.searchservice.dto;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;

import java.io.Serializable;

public class ResponseEntitySerializable<T> extends ResponseEntity implements Serializable {
    private static final long serialVersionUID = 1L;
    public ResponseEntitySerializable(HttpStatus status) {
        super(status);
    }

    public ResponseEntitySerializable(Object body, HttpStatus status) {
        super(body, status);
    }

    public ResponseEntitySerializable(MultiValueMap headers, HttpStatus status) {
        super(headers, status);
    }

    public ResponseEntitySerializable(Object body, MultiValueMap headers, HttpStatus status) {
        super(body, headers, status);
    }
}
