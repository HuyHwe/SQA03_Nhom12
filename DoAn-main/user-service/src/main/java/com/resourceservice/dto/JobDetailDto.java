package com.resourceservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobDetailDto extends JobDataModel {
    private String phone;
    private String email;
    private String introPhone;
    private String userPin;
    private Double distance;
    private Integer workingType;
    private Integer requiredExperienceLevel;
    private Integer requiredSkillLevel;
    private String profit;
    private String requiredSkill;
    private Long jobDefaultId;
    private Long organizationId;
    private String organizationName;
    private String status;
    private Long userId;
    private String organizationAvatar;
    private String organizationDes;
    public JobDetailDto(
            Long id,
            String name,
            String address,
            String job,
            Integer number,
            String salary,
            Double distance,
            Double lat,
            Double lg,
            LocalDateTime expdate,
            String phone,
            String email) {
        super(id, name, address, job, salary, number, lat, lg, expdate);
        this.distance = distance;
        this.phone = phone;
        this.email = email;
    }





    public JobDetailDto(
            Long id,
            Long jobDefaultId,
            String jobDefaultName,
            String name,
            String address,
            String job,
            Integer number,
            String salary,
            Double distance,
            Double lat,
            Double lng,
            LocalDateTime creationDate,
            LocalDateTime expDate,
            String province,
            String ward,
            String phone,
            String email,
            Integer workingType,
            String des,
            Integer requiredExperienceLevel,
            Integer requiredSkillLevel,
            String profit,
            String requiredSkill,
            Long organizationId,
            Long userId,
            String organizationName,
            String organizationAvatar,
            String organizationDes
    ) {
        super(id, jobDefaultName, name, address, job, salary, number, lat, lng, creationDate, expDate, province, ward, des);
        this.distance = distance;
        this.phone = phone;
        this.email = email;
        this.workingType = workingType;
        this.requiredExperienceLevel = requiredExperienceLevel;
        this.requiredSkillLevel = requiredSkillLevel;
        this.profit = profit;
        this.requiredSkill = requiredSkill;
        this.jobDefaultId = jobDefaultId;
        this.organizationId = organizationId;
        this.userId = userId;
        this.organizationName = organizationName;
        this.organizationAvatar = organizationAvatar;
        this.organizationDes = organizationDes;
    }

    public JobDetailDto(
            Long id,
            Long jobDefaultId,
            String jobDefaultName,
            String name,
            String address,
            String job,
            Integer number,
            String salary,
            Double lat,
            Double lg,
            LocalDateTime creationdate,
            LocalDateTime expdate,
            String province,
            String ward,
            String phone,
            String email,
            Integer workingType,
            String des,
            Integer requiredExperienceLevel,
            Integer requiredSkillLevel,
            String profit,
            String requiredSkill,
            Long organizationId,
            String organizationName,
            String organizationAvatar,
            String organizationDes) {
        super(id,jobDefaultName, name, address, job, salary, number, lat, lg, creationdate, expdate, province, ward, des);
        this.distance = distance;
        this.phone = phone;
        this.email = email;
        this.workingType = workingType;
        this.requiredExperienceLevel = requiredExperienceLevel;
        this.requiredSkillLevel = requiredSkillLevel;
        this.profit = profit;
        this.requiredSkill = requiredSkill;
        this.jobDefaultId = jobDefaultId;
        this.organizationId = organizationId;
        this.organizationName = organizationName;
        this.organizationAvatar = organizationAvatar;
        this.organizationDes = organizationDes;
    }

    public JobDetailDto(
            Long id,
            String name,
            String address,
            String job,
            Integer number,
            String salary,
            Double lat,
            Double lg,
            LocalDateTime expdate,
            String phone,
            String email) {
        super(id, name, address, job, salary, number, lat, lg, expdate);
        this.phone = phone;
        this.email = email;
    }
}
