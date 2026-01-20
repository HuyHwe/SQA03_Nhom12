package com.resourceservice.repository;

import com.resourceservice.model.Job;
import com.resourceservice.model.JobDefault;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobDefaultRepo<T, ID> extends JpaRepository<JobDefault, ID> {
}
