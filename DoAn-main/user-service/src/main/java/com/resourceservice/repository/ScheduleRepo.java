package com.resourceservice.repository;


import com.resourceservice.model.Schedule;
import feign.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.sql.Date;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleRepo extends JpaRepository<Schedule, Long> {

  @Query("SELECT s FROM Schedule s WHERE s.id = :id")
  Schedule findByScheduleId(Long id);

  @Query("SELECT s FROM Schedule s WHERE s.status = :status ORDER BY s.id DESC")

  Page<Schedule> getScheduleByStatus(@Param("status") String status, Pageable pageable);

  @Query("SELECT s " +
      "FROM Schedule s " +
      "WHERE s.startDate >= :startDate" +
      "  AND s.endDate <= :endDate" +
      " ORDER BY s.id DESC")
  Page<Schedule> getScheduleCalendar(@Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate, Pageable pageable);

  @Modifying
  @Query("UPDATE Schedule s SET s.active = :active WHERE s.id IN :scheduleIds")
  Integer updateByIds(@Param("active") Integer active,
      @Param("scheduleIds") List<Long> scheduleIds);

  @Query(value = "SELECT s FROM Schedule s " +
      "JOIN FETCH s.job " +
      "JOIN FETCH s.freelancer " +
      "WHERE s.freelancer.id IN :freelancerIds AND s.freelancer.active = 1 AND s.job.active = 1 ORDER BY s.id DESC",
      countQuery = "SELECT count(*) FROM Schedule s " +
          "JOIN Job j on s.job.id = j.id " +
          "JOIN Freelancer f on s.freelancer.id =f.id " +
          "WHERE s.freelancer.id IN :freelancerIds " +
          "AND f.active  = 1 AND j.active = 1"
  )
  Page<Schedule> findByFreelancerIdIn(List<Long> freelancerIds, Pageable pageable);

  @Query("SELECT s FROM Schedule s " +
      "JOIN FETCH s.job " +
      "JOIN FETCH s.freelancer " +
      "WHERE s.freelancer.id = :freelancerId AND s.job.id = :jobId " +
      " ORDER BY s.id DESC")
  List<Schedule> findByFreelancerAndJob(Long freelancerId, Long jobId);

  @Query("SELECT s FROM Schedule s WHERE s.status = :status ORDER BY s.id DESC")
  List<Schedule> aminGetScheduleByStatus(@Param("status") String status);
}
