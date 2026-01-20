package com.resourceservice.model.projection;

import java.time.LocalDateTime;

public interface CandidateInfoProjectionV2 extends AddressProjection {
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
    String getAddress();
    Double getSkillLevel();
    Double getExperienceLevel();
    String getSkillDes();
    String getExperienceDes();
    Integer getMatchScore();
}
