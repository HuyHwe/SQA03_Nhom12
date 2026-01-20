package com.resourceservice.dto;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;

@Setter
@Getter
public class RecruiterManagementDTO {
    private Long id;
    private Long freelancerId;
    private Long userId;
    private String note;
    private String status;
    private String comment;
    private Integer ratingStar;
}
