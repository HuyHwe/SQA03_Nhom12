package com.resourceservice.repository;

import com.resourceservice.model.RecruiterManagement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RecruiterManagementRepo<T, ID> extends JpaRepository<RecruiterManagement, ID> {

    @Modifying
    @Query("DELETE FROM RecruiterManagement r WHERE r.userCommon.id IN :userIds")
    public void deleteRecruiterManagementByUserId(List<Long> userIds);

    @Query("SELECT r.freelancerid FROM RecruiterManagement r WHERE r.userCommon.id = :userId")
    List<Long> findFreelancerByUid(@Param("userId") Long userId);

    @Query("SELECT r FROM RecruiterManagement r " +
            "WHERE r.userCommon.id = :userId " +
            "AND r.freelancerid = :freelancerId")
    Optional<RecruiterManagement> findByUserAndFreelancer(@Param("userId") Long userId, @Param("freelancerId") Long freelancerId);
}