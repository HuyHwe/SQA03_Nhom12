package com.resourceservice.model.projection;

import java.time.LocalDateTime;

public interface FreelancerProjection extends AddressProjection {
    Long getScheduleId();
    Long getId();
    Long getJobId();
    String getName();
    String getSalary();
    LocalDateTime getCreationDate();
    String getStatus();
    String getJobName();
    String getCv();
    Integer getMatchScore();
    String getReasons();
}
