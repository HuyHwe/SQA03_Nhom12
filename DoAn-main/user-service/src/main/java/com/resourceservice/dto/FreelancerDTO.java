package com.resourceservice.dto;
import com.jober.utilsservice.model.PageableModel;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class FreelancerDTO {
    private Long id;

    private Long userId;

    private String name;

    private String job;

    private String birthyear;

    private String gender;

    private String des;

    private String address;

    private Double lat;

    private Double lng;

    private String cv;

    private Integer active;

    private String workingtype;

    private Integer status;

    private String img;

    private String phone;

    private String email;

    private Integer ratingavr;

    private String salary;

    private Integer sendSmsNumber;
    private LocalDateTime creationDate;
    private String userPhone;
    private Long userLoginNumber;
    private PageableModel pageableModel;
    private String userPin;
    private Integer userRole;
    private String introPhone;
}
