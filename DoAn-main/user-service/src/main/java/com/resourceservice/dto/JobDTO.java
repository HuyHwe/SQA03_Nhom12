package com.resourceservice.dto;
import com.jober.utilsservice.model.PageableModel;
import lombok.*;

import javax.persistence.Column;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;

@Setter
@Getter
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDTO extends PageableModel {
    private Long id;
    private Long candidateManagementId;
    private Long userId;
//    company name
    private String name;
    private String job;
    private Double lat;
    private Double lng;
    private String phone;
    private String email;
    private LocalDateTime expDate;
    private Integer number;
    private String address;
    private String des;
    private String cv;
    private Integer active;
    private Integer level;
    private Integer workingType;
    private String img;
    private String website;
    private String type;
    private String salary;
    private Integer sendSmsNumber;
    private String userPhone;
    private Integer requiredExperienceLevel;
    private Integer requiredSkillLevel;
    private String profit;
    private String requiredSkill;
    private String province;
    private String ward;
//    check is saved or not
    private String status;
    private LocalDateTime creationDate;
    private Long jobDefaultId;
    private String companyName;
    private String companyDes;
    private String organizationAvatar;
}
