package com.resourceservice.repository;

import com.resourceservice.dto.JobDTO;
import com.resourceservice.dto.JobDetailDto;
import com.resourceservice.dto.ResponseApplyDto;
import com.resourceservice.model.Job;
import com.resourceservice.model.projection.JobProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JobRepo<T, ID> extends JpaRepository<Job, ID> {
    Job findByPhone(String phone);

    @Query(value = "SELECT j FROM Job j WHERE j.id = :jobId")
    Job findJobById(@Param("jobId") Long jobId);

    @Query(value = "SELECT j FROM Job j INNER JOIN CandidateManagement cm on j.id = cm.job.id INNER JOIN Schedule s on j.id = s.job WHERE j.userCommon.id = :userId")
    Page<Job> findJobsCompleted(@Param("userId") Long uid, Pageable pageable);

    @Query(value = "SELECT j.id from Job j WHERE j.userCommon.id = :uid")
    List<Long> findIdsByUid(Long uid);

    @Query(value = "SELECT j from Job j WHERE j.id IN :ids ORDER BY j.id DESC")
    Page<Job> findByIds(List<Long> ids, Pageable pageable);

    @Query(value = "SELECT j from Job j WHERE j.job LIKE :jobName% ORDER BY j.id DESC")
    Page<Job> findJobsByJobName(String jobName, Pageable pageable);

    @Query(value = "SELECT j from Job j WHERE j.address LIKE ?1% ORDER BY j.id DESC")
    Page<Job> findJobsByAddress(String address, Pageable pageable);

    @Query(value = "SELECT j from Job j WHERE j.address LIKE :address% AND j.job LIKE :jobName% ORDER BY j.id DESC")
    Page<Job> findJobs(String address, String jobName, Pageable pageable);

    @Query(value = "SELECT j from Job j " +
            "WHERE( j.address LIKE :keySearch% OR j.job LIKE :keySearch% OR j.email LIKE :keySearch% OR j.phone LIKE :keySearch% OR j.name LIKE :keySearch% OR j.des LIKE :keySearch% ) " +
            "ORDER BY j.id DESC")
    Page<Job> findJobs(String keySearch, Pageable pageable);

    @Query(value = "SELECT j from Job j ORDER BY j.id DESC")
    Page<Job> findJobs(Pageable pageable);

    @Query(value = "SELECT j.id AS id, j.name  AS jname, j.jobDefault.name AS jobDefaultName, jd.id AS jdId, " +
            "j.active AS status, j.creationDate AS creationDate, j.workingType AS workingType, " +
            "j.province AS province, " +
            "j.ward AS ward, j.expDate AS expDate, j.salary AS salary  " +
            "FROM Job j " +
            "INNER JOIN JobDefault jd ON j.jobDefault.id = jd.id " +
            "WHERE j.userCommon.id = :userId AND j.active = 1 AND j.expDate >= CURRENT_DATE")
    Page<JobProjection> findJobsByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query(value = "SELECT j from Job j WHERE j.id in :ids")
    List<Job> findByIds(@Param("ids") List<Long> ids);

    @Modifying
    @Query("DELETE FROM Job j WHERE j.userCommon.id in :userIds")
    void deleteJobByUsers(List<Long> userIds);

    Page<Job> findByOrganizationIdAndActiveAndExpDateAfter(Long organizationId, Integer active, LocalDateTime expDate, Pageable pageable);
    Page<Job> findByOrganizationIdAndIdNotAndActiveAndExpDateAfter(Long organizationId, Long id, Integer active, LocalDateTime expDate, Pageable pageable);

    @Query(value = "SELECT j from Job j WHERE j.active = 1")
    Page<Job> listJobs(Pageable pageable);

    @Query(value = "SELECT j FROM Schedule a " +
            "JOIN Freelancer f ON a.freelancer.id = f.id " +
            "JOIN Job j ON j.id = a.job.id " +
            "WHERE f.userCommon.id = :userId " +
            "AND a.status = '1'")
    Page<Job> listApplyJob(@Param("userId") Long userId, Pageable pageable);

    @Query(value = "SELECT j FROM CandidateManagement c " +
            "JOIN Job j ON j.id = c.job.id " +
            "WHERE c.userCommon.id = :userId " +
            "AND c.status = '1'")
    Page<Job> findSavedJobs(@Param("userId") Long userId, Pageable pageable);

    @Query(value = "SELECT j FROM CandidateManagement c " +
            "JOIN Job j ON c.job.id = j.id " +
            "WHERE c.userCommon.id = :userId " +
            "AND c.note = :note " +
            "AND c.status = '1'")
    Page<Job> ListJobsByNote(@Param("userId") Long userId, @Param("note") String note, Pageable pageable);

    @Query(value = "SELECT j FROM Job j " +
            "INNER JOIN UserCommon u ON j.userCommon.id = u.id " +
            "WHERE u.loginNumber >= 0 " +
            "AND j.expDate > :localDateTime " +
            "AND u.phone != '0359999561' " +
            "ORDER BY j.id DESC")
    Page<Job> getLatestJob(LocalDateTime localDateTime, Pageable pageable);

    @Modifying
    @Query("UPDATE Job j SET j.active = :active  WHERE j.id = :jobId")
    Integer updateJobById(Integer active, Long jobId);

    @Query(value = "SELECT new com.resourceservice.dto.ResponseApplyDto(f.name, f.phone, am.creationDate) " +
            "FROM Schedule am " +
            "JOIN Job j ON am.job = j.id " +
            "JOIN Freelancer f ON am.freelancer = f.id " +
            "WHERE j.userCommon.phone = :phone")
    Page<ResponseApplyDto> listPeopleApply(String phone, Pageable pageable);

    @Query(value = "SELECT j.name, j.job, j.salary, j.des, j.address, j.cv, j.active, j.creationDate, j.expDate " +
            "    FROM Job j " +
            "WHERE j.userCommon.phone = :phone ORDER BY j.id DESC")
    Page<Job> listJobByUser(String phone, Pageable pageable);

    @Modifying
    @Query("DELETE FROM Job j WHERE j.id IN :ids")
    Integer deleteJobByIds(List<Long> ids);

    @Query(value = "SELECT " +
            "new com.resourceservice.dto.JobDetailDto(" +
            " f.id, " +
            "f.name, " +
            "f.address, " +
            "f.job, " +
            "f.number, " +
            "f.salary, " +
            "(DEGREES(ACOS(LEAST(1.0, COS(RADIANS(f.lat)) " +
            "* COS(RADIANS(:latitude)) " +
            "* COS(RADIANS(f.lng - :longitude)) " +
            "+ SIN(RADIANS(f.lat)) " +
            "* SIN(RADIANS(:latitude))))) * 111.111), " +
            "f.lat, " +
            "f.lng, " +
            "f.expDate, " +
            "f.phone, " +
            "f.email) " +
            "FROM Job f " +
            "WHERE " +
            "111.111 * " +
            "DEGREES(ACOS(LEAST(1.0, COS(RADIANS(f.lat)) " +
            "* COS(RADIANS(:latitude)) " +
            "* COS(RADIANS(f.lng - :longitude)) " +
            "+ SIN(RADIANS(f.lat)) " +
            "* SIN(RADIANS(:latitude))))) < 30 " +
            "ORDER BY f.id DESC")
    Page<JobDetailDto> listJobsNearBy(@Param("latitude") Double latitude, @Param("longitude") Double longitude, Pageable pageable);

    @Query("SELECT j.id FROM Job j WHERE j.userCommon.id = :userId")
    List<Long> findIdsByUserId(Long userId);

    @Query("SELECT MAX(j.id) FROM Job j WHERE j.userCommon.id = :userId AND j.jobDefault.id = :jobDefaultId AND j.expDate >= CURRENT_DATE AND j.active = 1")
    Long findJobIdByJobDefaultIdAndUserId(Long jobDefaultId, Long userId);

    @Modifying
    @Query("UPDATE Job j SET j.active = :active  WHERE j.id IN :ids")
    Integer updateByIds(@Param("active") Integer active, @Param("ids") List<Long> ids);

    @Query("SELECT j FROM Job j\n" +
            "WHERE j.userCommon.id = :uid\n" +
            "AND j.active = 1\n" +
            "AND j.expDate >= CURRENT_DATE")
    List<Job> findJobDefaultIdsHavePostByRecruiter(Long uid);

    @Query("SELECT DISTINCT YEAR(j.creationDate) FROM Job j WHERE j.active = 1 ORDER BY YEAR(j.creationDate)")
    List<Integer> findDistinctYears();

    @Query("SELECT YEAR(j.creationDate), COUNT(j) FROM Job j WHERE j.active = 1 GROUP BY YEAR(j.creationDate)")
    List<Object[]> countJobsByYear();

    @Query("SELECT MONTH(j.creationDate), COUNT(j) FROM Job j WHERE j.active = 1 AND YEAR(j.creationDate) = :year GROUP BY MONTH(j.creationDate)")
    List<Object[]> countJobsByMonth(@Param("year") int year);

    @Query("SELECT j.creationDate, COUNT(j) FROM Job j WHERE j.creationDate >= :startDate AND j.creationDate <= :endDate AND j.active = 1 GROUP BY j.creationDate")
    List<Object[]> findJobPostingsByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT j.salary, COUNT(j) FROM Job j WHERE j.creationDate >= :startDate AND j.creationDate <= :endDate AND j.active = 1 GROUP BY j.salary")
    List<Object[]> findSalaryByIndustry(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT DISTINCT j.jobDefault.id FROM Job j " +
            "WHERE j.userCommon.id = :userId " +
            "AND (DEGREES(ACOS(LEAST(1.0, COS(RADIANS(j.lat)) " +
            "    * COS(RADIANS(:latitude)) " +
            "    * COS(RADIANS(j.lng - :longitude)) " +
            "    + SIN(RADIANS(j.lat)) * SIN(RADIANS(:latitude))))) * 111.111) <= 100")
    List<Long> findJobDefaultIdsByUserIdAndLocation(@Param("userId") Long userId,
                                                    @Param("latitude") Double latitude,
                                                    @Param("longitude") Double longitude);

    @Query("SELECT j FROM Job j WHERE j.userCommon.id = :userId AND j.active = :active AND j.expDate >= :now")
    List<Job> findByUserIdAndActiveAndExpDateAfter(@Param("userId") Long userId,
                                                   @Param("active") Integer active,
                                                   @Param("now") LocalDateTime now);

    Page<Job> findByOrganizationId(Long organizationId,Pageable pageable);

    // Đếm job theo mốc thời gian và trạng thái
    Long countByCreationDateAfterAndActive(LocalDateTime date, Integer active);

    // Đếm tất cả job đang active
    Long countByActive(Integer active);
}
