package com.resourceservice.repository;

import com.resourceservice.model.Freelancer;
import com.resourceservice.model.UserCommon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRepo<T, ID> extends JpaRepository<UserCommon, ID> {
    /*@Query(value = "SELECT f from RecruiterManagement r " +
            "LEFT JOIN Freelancer f " +
            "ON f.id = r.freelancerid " +
            "WHERE r.note = :typeNote " +
            "AND r.userid = :userId " +
            "AND f.active <> 0 " +
            "AND f.status = 1")
    Page<Freelancer> listFreelancersByNote(@Param("userId") Long userId, @Param("typeNote") String typeNote, Pageable pageable);
*/
}
