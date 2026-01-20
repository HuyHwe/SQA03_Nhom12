package com.resourceservice.dto.request;

import lombok.Data;

@Data
public class FreelancerCreateDTO {
    private Long jobDefaultId;
    private Long userId;
    private double lat;
    private double lng;
    private String cv;
    private String workingType;
    private String salary;
    private String experienceDes;
    private String skillDes;
}
