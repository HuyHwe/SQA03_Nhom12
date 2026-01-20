package com.resourceservice.dto.request;

import lombok.Data;

@Data
public  class FreelancerStatsRequest {
    private Long jobId;
    private Long recruiterId;
    private Integer topK;
}
