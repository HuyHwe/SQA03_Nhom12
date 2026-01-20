package com.resourceservice.repository;

import com.resourceservice.dto.CandidateDto;
import com.resourceservice.model.Freelancer;
import com.resourceservice.model.Job;
import com.resourceservice.model.Schedule;
import com.resourceservice.model.projection.CandidateInfoProjection;
import com.resourceservice.model.projection.CandidateInfoProjectionV2;
import com.resourceservice.model.projection.FreelancerProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface FreelancerRepo<T, ID> extends JpaRepository<Freelancer, ID> {

    @Query(value = "SELECT fl FROM Freelancer fl INNER JOIN Schedule s ON s.freelancer = fl.id INNER JOIN Job j ON j.id = s.job WHERE j.userCommon.id = :userId AND fl.active <> 0 AND fl.status = 1")
    Page<Freelancer> findFreelancerByIds(Long userId, Pageable pageable);

    @Query(value = "SELECT fl FROM Freelancer fl WHERE fl.userCommon.id = :userId AND fl.jobDefaultId = :jobDefaultId")
    Freelancer findFreelancerByUserIdAndJobDefaultId(Long userId, Long jobDefaultId);
    @Query(value = "SELECT f from Freelancer f WHERE f.job LIKE :jobName% ORDER BY f.id DESC")
    Page<Job> findFreelancersByJobName(String jobName, Pageable pageable);
    @Query(value = "SELECT f from Freelancer f WHERE f.address LIKE ?1% ORDER BY f.id DESC")
    Page<Job> findFreelancersByAddress(String address, Pageable pageable);
    @Query(value = "SELECT f from Freelancer f WHERE f.address LIKE :address% AND f.job LIKE :jobName% ORDER BY f.id DESC")
    Page<Freelancer> findFreelancers(String address, String jobName, Pageable pageable);

    @Query(value = "SELECT f from Freelancer f ORDER BY f.id DESC")
    Page<Freelancer> findFreelancers(Pageable pageable);

    @Query(value = "SELECT " +
            "new com.resourceservice.dto.CandidateDto(" +
            "f.id, " +
            "f.name, " +
            "f.birthyear, " +
            "f.gender, " +
            "f.job, " +
            "f.address, " +
            "(DEGREES(ACOS(LEAST(1.0, COS(RADIANS(f.lat)) " +
            "* COS(RADIANS(:latitude)) " +
            "* COS(RADIANS(f.lng - :longitude)) " +
            "+ SIN(RADIANS(f.lat)) " +
            "* SIN(RADIANS(:latitude))))) * 111.111), " +
            "f.des, " +
            "f.salary, " +
            "f.cv, " +
            "f.phone, " +
            "f.email, " +
            "f.lat, " +
            "f.lng) " +
            "FROM Freelancer f " +
            "WHERE " +
            "111.111 * " +
            "DEGREES(ACOS(LEAST(1.0, COS(RADIANS(f.lat)) " +
            "* COS(RADIANS(:latitude)) " +
            "* COS(RADIANS(f.lng - :longitude)) " +
            "+ SIN(RADIANS(f.lat)) " +
            "* SIN(RADIANS(:latitude))))) < 30 " +
            "AND f.active <> 0 " +
            "AND f.status = 1 " +
            "ORDER BY f.id DESC")
    Page<CandidateDto> listCandidate(@Param("latitude") Double latitude, @Param("longitude") Double longitude, Pageable pageable);

    @Query(value = "SELECT " +
            "new com.resourceservice.dto.CandidateDto(" +
            "f.id, " +
            "f.name, " +
            "f.birthyear, " +
            "f.gender, " +
            "f.job, " +
            "f.address, " +
            "f.des, " +
            "f.salary, " +
            "f.cv, " +
            "f.phone, " +
            "f.email, " +
            "f.lat, " +
            "f.lng) " +
            "FROM Freelancer f " +
            "WHERE f.active <> 0 " +
            "AND f.status = 1 " +
            "ORDER BY f.id DESC")
    Page<CandidateDto> listCandidateCommon(Pageable pageable);

    @Query(value = "SELECT f from RecruiterManagement r " +
            "LEFT JOIN Freelancer f " +
            "ON f.id = r.freelancerid " +
            "WHERE r.note = :typeNote " +
            "AND r.userCommon.phone = :phone " +
            "AND f.active <> 0 " +
            "AND f.status = 1")
    Page<Freelancer> listFreelancersByNote(@Param("phone") String phone, @Param("typeNote") String typeNote, Pageable pageable);

    @Query(value = "SELECT f from Freelancer f " +
            "WHERE f.id IN :ids " +
            "AND f.active <> 0 " +
            "AND f.status = 1")
    List<Freelancer> findByIds(@Param("ids") List<Long> listIdsPost);

    @Query(value = "SELECT f from RecruiterManagement r " +
            "LEFT JOIN Freelancer f " +
            "ON f.id = r.freelancerid " +
            "WHERE r.note = :typeNote " +
            "AND r.userCommon.id = :userId " +
            "AND f.active <> 0 " +
            "AND f.status = 1")
    Page<Freelancer> findByNoteCSV(@Param("userId") Long userId, @Param("typeNote") String typeNote, Pageable pageable);

    @Query(value = "SELECT f FROM Freelancer f " +
            "WHERE f.userCommon.id = :userId " +
            "AND f.status = 1 " +
            "AND f.active <> 0")
    Page<Freelancer> listFreelanceByUserId(@Param("userId") Long userId, Pageable pageable);
//    Modifying anotation for deleting
    @Modifying
    @Query("DELETE FROM Freelancer f WHERE f.userCommon.id IN :userIds")
    void deleteFreelancerByUsers(List<Long> userIds);
    @Modifying
    @Query("DELETE FROM Freelancer f WHERE f.id IN :freelancerIds")
    Integer deleteFreelancerByIds(List<Long> freelancerIds);
    @Query("SELECT f FROM Freelancer f INNER JOIN UserCommon u ON f.userCommon.id = u.id " +
            "WHERE f.lat != :freelancerLat AND f.phone != :freelancerPhone AND u.loginNumber > 0")
    Page<Freelancer> latestFreelancer(Double freelancerLat, String freelancerPhone, Pageable pageable);

    @Modifying
    @Query("UPDATE Freelancer f SET f.status = :status  WHERE f.id = :freelancerId")
    Integer updateFreelancerById(Integer status, Long freelancerId);

    @Query(value = "SELECT f FROM Freelancer f " +
            "WHERE f.userCommon.id = :userId " +
            "AND f.active <> 0")
    List<Freelancer> findByUserId(Long userId);

    @Query("SELECT f.id FROM Freelancer f WHERE f.userCommon.id = :userId")
    List<Long> findIdsByUserId(Long userId);

    @Query("SELECT s.id AS scheduleId, s.freelancer.id AS id, " +
            "u.name AS name, s.freelancer.salary AS salary, " +
            "u.province AS province, u.ward AS ward, " +
            "s.creationDate AS creationDate, s.status AS status, s.job.id AS jobId, j.name AS jobName, " +
            "f.cv as cv , f.matchScore as matchScore " +
            "FROM Schedule s " +
            "INNER JOIN Job j ON s.job.id = j.id " +
            "INNER JOIN Freelancer f ON s.freelancer.id = f.id " +
            "INNER JOIN UserCommon u ON u.id = f.userCommon.id " +
            "WHERE j.userCommon.id = :userId " +
            "ORDER BY s.id DESC")
    Page<FreelancerProjection> findAppliedCandidate(Long userId, Pageable pageable);

    @Query("SELECT f.id AS freelancerId, f.salary AS salary, " +
            "u.province AS province, u.ward AS ward, " +
            "u.id AS userId, u.name AS name, u.phone AS phone, u.email AS email," +
            "u.avatar AS avatar, u.dateOfBirth AS dateOfBirth, " +
            "f.experienceDes AS experience, f.jobTarget AS jobTarget , u.gender AS gender, f.cv AS cv " +
            "FROM Freelancer f " +
            "INNER JOIN UserCommon u ON f.userCommon.id = u.id " +
            "WHERE f.id = :freelancerId ")
    CandidateInfoProjection getById(Long freelancerId);
    @Query("SELECT f.id AS freelancerId, f.salary AS salary, " +
            "u.province AS province, u.ward AS ward, " +
            "u.id AS userId, u.name AS name, u.phone AS phone, u.email AS email," +
            "u.avatar AS avatar, u.dateOfBirth AS dateOfBirth, u.detailAddress AS address, " +
            "f.experienceDes AS experienceDes, f.jobTarget AS jobTarget , u.gender AS gender, f.cv AS cv, " +
            "f.skillLevel as skillLevel, f.skillDes as skillDes, f.experienceLevel as experienceLevel, f.matchScore as matchScore " +
            "FROM Freelancer f " +
            "INNER JOIN UserCommon u ON f.userCommon.id = u.id " +
            "WHERE f.id = :freelancerId ")
    CandidateInfoProjectionV2 getByIdV2(Long freelancerId);
    @Query("SELECT f.id AS freelancerId, f.salary AS salary, " +
            "u.province AS province,  u.ward AS ward, " +
            "u.id AS userId, u.name AS name, u.phone AS phone, u.email AS email," +
            "u.avatar AS avatar, u.dateOfBirth AS dateOfBirth, u.detailAddress AS address, " +
            "f.experienceDes AS experienceDes, f.jobTarget AS jobTarget , " +
            "u.gender AS gender, f.cv AS cv, s.status AS status, f.matchScore as matchScore " +
            "FROM Freelancer f " +
            "INNER JOIN UserCommon u ON f.userCommon.id = u.id " +
            "LEFT JOIN Schedule s ON s.freelancer.id = :freelancerId " +
            "WHERE f.id = :freelancerId AND s.job.id = :jobId")
    List<CandidateInfoProjectionV2> getByIdAndJobId(Long freelancerId, Long jobId);
    @Query("SELECT f.id AS freelancerId, " +
            "u.id AS userId, u.name AS name, u.phone AS phone," +
            "f.cv AS cv, jd.id as jdId, jd.name as jdName, " +
            "f.creationDate as creationDate, f.matchScore as mathScore, f.reasons as reasons " +
            "FROM Freelancer f " +
            "INNER JOIN UserCommon u ON f.userCommon.id = u.id " +
            "LEFT JOIN JobDefault jd ON f.jobDefaultId = jd.id " +
            "WHERE u.id = :userId ORDER BY f.creationDate DESC")
    Page<CandidateInfoProjection> getByUserId(Long userId, Pageable pageable);
    @Modifying
    @Query("UPDATE Freelancer s SET s.active = :active WHERE s.id IN :postIds")
    Integer updateByIds(@feign.Param("active") Integer active, @feign.Param("postIds") List<Long> postIds);

    @Query("SELECT f FROM Freelancer f\n" +
            "WHERE f.userCommon.id = :uid\n" +
            "AND f.active = 1")
    List<Freelancer> findJobDefaultIdsHavePostByCandidate(Long uid);
    @Query("SELECT DISTINCT YEAR(f.creationDate) FROM Freelancer f WHERE f.active = 1 ORDER BY YEAR(f.creationDate)")
    List<Integer> findDistinctYears();

    @Query("SELECT YEAR(f.creationDate), COUNT(f) FROM Freelancer f WHERE f.active = 1 GROUP BY YEAR(f.creationDate)")
    List<Object[]> countFreelancersByYear();

    @Query("SELECT MONTH(f.creationDate), COUNT(f) FROM Freelancer f WHERE f.active = 1 AND YEAR(f.creationDate) = :year GROUP BY MONTH(f.creationDate)")
    List<Object[]> countFreelancersByMonth(@Param("year") int year);
    @Modifying
    @Transactional
    @Query("DELETE FROM Freelancer c WHERE c.userCommon.id = :userId AND c.cv IN :cvNames")
    void deleteByUserIdAndCvIn(@Param("userId") Long userId, @Param("cvNames") List<String> cvNames);

    @Query(
            value = "SELECT * " +
                    "FROM freelancer f " +
                    "WHERE f.embedding IS NOT NULL " +
                    "ORDER BY f.embedding <=> CAST(:jobEmbedding AS vector) " +
                    "LIMIT :limit",
            nativeQuery = true
    )
    List<Freelancer> recommendFreelancers(
            @Param("jobEmbedding") String jobEmbedding,
            @Param("limit") int limit
    );

    @Query(value = "SELECT f.* FROM freelancer f " +
            "INNER JOIN node_embedding ne ON f.id = ne.node_id AND ne.node_type = 'candidate' " +
            "WHERE f.jobdefaultid = :jobDefaultId AND f.active = :active " +
            "AND ne.embedding IS NOT NULL",
            nativeQuery = true)
    List<Freelancer> findByJobDefaultIdAndActiveAndEmbeddingNotNull(
            @Param("jobDefaultId") Long jobDefaultId,
            @Param("active") Integer active);
}
