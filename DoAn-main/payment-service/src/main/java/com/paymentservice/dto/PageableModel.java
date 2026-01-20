package com.paymentservice.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class PageableModel implements Serializable {

    private static final long serialVersionUID = -4922803726535108526L;
    private Integer page;
    private Integer size;
}
