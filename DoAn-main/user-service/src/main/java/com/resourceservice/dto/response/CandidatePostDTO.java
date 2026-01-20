package com.resourceservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CandidatePostDTO {
    private Long freelancerId;
    private Long jdId;
    private String name;
    private String phone;
    private String jdName;
    private String cv;
    private LocalDateTime creationDate;
    private Integer mathScore;
    private String reasons;
}
