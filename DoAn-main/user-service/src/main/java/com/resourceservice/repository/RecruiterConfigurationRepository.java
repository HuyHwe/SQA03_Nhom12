package com.resourceservice.repository;

import com.resourceservice.model.RecruiterConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecruiterConfigurationRepository extends JpaRepository<RecruiterConfiguration, Long> {
}
