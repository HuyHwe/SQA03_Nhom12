package com.resourceservice.repository;

import com.resourceservice.model.CandidateManagement;
import com.resourceservice.model.RecruiterManagement;
import com.resourceservice.model.projection.CandidateManagementProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateManagementRepo<T, ID> extends JpaRepository<CandidateManagement, ID> {
    @Modifying
    @Query("DELETE FROM CandidateManagement c WHERE c.userCommon.id IN :userIds")
    void deleteCandidateManagementByUsers(List<Long> userIds);

    @Query("SELECT r FROM CandidateManagement r " +
            "WHERE r.userCommon.id = :userId " +
            "AND r.job.id = :jobId")
    Optional<RecruiterManagement> findByUserAndJob(@Param("userId") Long userId, @Param("jobId") Long jobId);
    @Query("SELECT c FROM CandidateManagement c " +
            "JOIN FETCH c.job " +
            "WHERE c.job.id = :jobId AND c.userCommon.id = :userId")
    List<CandidateManagementProjection> findSavedJob(Long jobId, Long userId);
    @Query("SELECT c FROM CandidateManagement c " +
            "JOIN FETCH c.job " +
            "WHERE c.userCommon.id = :userId and c.job.expDate >= CURRENT_DATE order by c.userCommon.id ")
    List<CandidateManagementProjection> findSavedJobs(Long userId, Pageable pageable);
    @Query("SELECT COUNT(c) FROM CandidateManagement c " +
            "JOIN c.job j " +
            "WHERE c.userCommon.id = :userId and j.expDate >= CURRENT_DATE")
    Long countSavedJobs(Long userId);
    @Query("SELECT c FROM CandidateManagement c " +
            "WHERE c.userCommon.id = :userId " +
            "AND c.job.id IN :jobIds")
    List<CandidateManagement> findCandidateByUserAndJob(Long userId, List<Long> jobIds);
}
