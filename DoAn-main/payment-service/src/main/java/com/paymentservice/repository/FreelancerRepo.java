package com.paymentservice.repository;

import com.paymentservice.model.Freelancer;
import com.paymentservice.model.UserCommon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FreelancerRepo<T, ID> extends JpaRepository<Freelancer, ID> {
}
