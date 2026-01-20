package com.resourceservice.dto.request;

import com.resourceservice.model.Freelancer;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FreelancerMatch {
    private Freelancer freelancer;
    private double score;

    public Long getUserId() { return freelancer.getUserCommon().getId(); }
}
