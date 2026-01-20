package com.resourceservice.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder(toBuilder = true)
public class CandidatesJob {
    private Long scheduleId;
    private String name;
//    job des
    private Long jobId;
    private String des;
    private String jobDefaultName;
    private String province;
    private String ward;
    private String salary;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime creationDate;
    private LocalDateTime expDate;
    private String profit;
    private Integer workingType;
    private Integer requiredExperienceLevel;
    private Integer requiredSkillLevel;
    private String requiredSkill;
    private Integer number;
    private String phone;
    private String email;

}
