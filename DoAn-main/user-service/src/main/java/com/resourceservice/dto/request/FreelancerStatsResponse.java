package com.resourceservice.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FreelancerStatsResponse {

    // Thông tin cơ bản (Khớp với Pydantic: id, name, job, ...)
    private Long id;
    private String name;
    private String job;
    private String skillDes;
    private String experienceDes;
    private String jobTarget;
    private Integer experienceLevel;
    private Integer skillLevel;
    private String phone;
    private String email;
    private String avatar;

    // Điểm số chính (Khớp với Pydantic: score, similarityScore, ...)
    private Double score;
    private Double similarityScore;
    private Double gnnScore;
    private Double behaviorBoost;

    // cvMatchScore là Optional[int] trong Python, dùng Integer trong Java
    private Integer cvMatchScore;
}
