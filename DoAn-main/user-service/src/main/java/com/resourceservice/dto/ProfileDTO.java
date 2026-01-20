package com.resourceservice.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProfileDTO {
    private Long id;
    private String name;
    private String phone;
    private LocalDateTime dateOfBirth;
    private String gender;
    private String email;
    private String avatar;
    private String nationality;
    private String country;
    private String province;
    private String ward;
    private String detailAddress;
    private String experience;
    private Long organizationId;
    private RecruiterRateDTO recruiterRate;
    private String experienceDes;
    private String skillDes;
    private Double experienceLevel;
    private Double skillLevel;
    private Integer role;
    private String salary;
    private String jobTarget;
    private LocalDateTime creationDate;
    private String cv;
    private String status;
    private Integer matchScore;
    public ProfileDTO(
        String name,
        String phone,
        LocalDateTime dateOfBirth,
        String gender,
        String email,
        String avatar,
        Integer role,
        String nationality,
        String country,
        String province,
        String ward,
        String detailAddress,
        String experience) {
        this.name = name;
        this.phone = phone;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.email = email;
        this.avatar = avatar;
        this.role = role;
        this.nationality = nationality;
        this.country = country;
        this.province = province;
        this.ward = ward;
        this.detailAddress = detailAddress;
        this.experience = experience;
    }
}
