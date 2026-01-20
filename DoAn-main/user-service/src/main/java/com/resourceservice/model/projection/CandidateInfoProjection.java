package com.resourceservice.model.projection;

import com.resourceservice.dto.RecruiterRateDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface CandidateInfoProjection extends AddressProjection {
    Long getFreelancerId();
    Long getJdId();
    String getJdName();
    Long getUserId();
    String getName();
    String getSalary();
    String getEmail();
    String getPhone();
    String getAvatar();
    LocalDateTime getDateOfBirth();
    String getJobTarget();
    String getExperience();
    String getGender();
    String getCv();
    LocalDateTime getCreationDate();
    String getStatus();
    Integer getMathScore();
    String getReasons();
}
