package com.resourceservice.model.projection;

import com.resourceservice.model.Job;

public interface CandidateManagementProjection {
    String getStatus();
    Long getId();
    Job getJob();
}
