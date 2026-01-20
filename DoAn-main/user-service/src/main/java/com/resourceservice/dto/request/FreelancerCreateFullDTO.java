package com.resourceservice.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class FreelancerCreateFullDTO {
    private Long userId;
    private Long jobDefaultId;
    private String name;
    private String job;
    private String birthyear;
    private String gender;
    private String des;
    private String address;
    private double lat;
    private double lng;
    private String cv;
    private String workingType;
    private Integer status;
    private String img;
    private String phone;
    private String email;
    private String experienceDes;
    private String skillDes;
    private String salary;
    private String ward;
    private String province;
    private String jobTarget;
    private Integer experienceLevel;
    private Integer skillLevel;
    private Integer mathScore;
    private String reasons;
    private Long jobId;
    private List<Float> cvEmbedding;

}
