package com.paymentservice.repository;

import com.paymentservice.model.Freelancer;
import com.paymentservice.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRepo<T, ID> extends JpaRepository<Job, ID> {
}
