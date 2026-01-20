package com.resourceservice.repository;

import com.resourceservice.dto.ProfileDTO;
import com.resourceservice.dto.RecruiterJob;
import com.resourceservice.model.StatisticalUser;
import com.resourceservice.model.UserCommon;
import com.resourceservice.model.projection.RatingProjection;
import com.resourceservice.model.projection.StandoutUserProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserCommonRepo extends JpaRepository<UserCommon, Long> {
    @Query(value = "SELECT rm.ratingstar, COUNT(rm.id) " +
            "FROM Freelancer fl " +
            "INNER JOIN RecruiterManagement rm ON fl.id = rm.freelancerid " +
            "WHERE fl.userCommon.id = :userId AND rm.ratingstar BETWEEN 1 AND 5 " +
            "GROUP BY rm.ratingstar")
    List<Object[]> getCountRatingForStar(@Param("userId") Long userId);
    @Query(value = "SELECT rm.ratingstar AS rating, COUNT(rm.id) AS number " +
            "FROM Freelancer fl " +
            "INNER JOIN RecruiterManagement rm ON fl.id = rm.freelancerid " +
            "INNER JOIN UserCommon uc ON uc.id = fl.userCommon.id " +
            "WHERE fl.id = :freelancerId " +
            "GROUP BY rm.ratingstar")
    List<RatingProjection> getCountRating(@Param("freelancerId") Long freelancerId);
    @Query(value = "SELECT new com.resourceservice.dto.ProfileDTO(uc.name, uc.phone, uc.dateOfBirth, uc.gender, uc.email, uc.avatar, uc.role, uc.nationality, uc.country, uc.province, uc.ward, uc.detailAddress, uc.experience) FROM UserCommon uc WHERE uc.id = :userId")
    ProfileDTO findProfileByUid(@Param("userId") Long userId);
    @Query(value = "SELECT uc FROM UserCommon uc WHERE uc.phone = :phoneNumber")
    UserCommon findByPhoneEquals(@Param(value = "phoneNumber") String phoneNumber);
    @Query(value = "SELECT uc FROM UserCommon uc WHERE uc.email = :email")
    UserCommon findByEmail(@Param(value = "email") String email);
//    UserCommon save(UserCommon userCommon);
    @Query(value = "SELECT d from UserCommon d WHERE (d.role = :viceAdmin or d.role = :admin) ORDER BY d.id desc")
    Page<UserCommon> findAdmins(@Param("viceAdmin") int viceAdmin, @Param("admin") int admin, Pageable pageable);
    @Query(value = "SELECT d from UserCommon d WHERE (d.role IN :roles) ORDER BY d.id desc")
    Page<UserCommon> findUsers(List roles, Pageable pageable);
    @Query(value = "SELECT d from UserCommon d WHERE (d.role IN :roles) AND d.creationDate >= :startDate AND d.creationDate <= :endDate ORDER BY d.creationDate ASC")
    List<UserCommon> statisticalUserByTime(List roles, LocalDateTime startDate, LocalDateTime endDate);

    @Query(value = "SELECT u from UserCommon u WHERE (u.status = :status) ORDER BY u.id desc")
    Page<UserCommon> findBlockedUsers(String status, Pageable pageable);

    @Query(value = "SELECT uc.avatar FROM UserCommon uc WHERE uc.id = :userId")
    String getAvatarByUserId(@Param("userId") Long userId);
    @Modifying
    @Query("DELETE FROM UserCommon u WHERE u.id IN :userIds")
    void deleteUserCommonByIds(List<Long> userIds);

    @Query(value = "SELECT d from UserCommon d WHERE (d.role IN :roles) AND d.introPhone =:introPhone ORDER BY d.id desc")
    Page<UserCommon> findIntroducedUsers(List roles, String introPhone, Pageable pageable);

    String queryStatisticalUser = "SELECT * FROM\n" +
            "\t(SELECT COUNT(u.id) AS activeUsersAmount FROM usercommon u \n" +
            "\t \tWHERE u.status = '1'  AND u.role IN :roles AND u.creationdate >= :startDate AND u.creationdate <= :endDate) AS a\n" +
            "\t,(SELECT COUNT(u.id) AS inActiveUsersAmount FROM usercommon u \n" +
            "\t  \tWHERE u.status = '0'  AND u.role IN :roles AND u.creationdate >= :startDate AND u.creationdate <= :endDate) AS b\n";
    @Query(value = queryStatisticalUser, nativeQuery = true)
    StatisticalUser statisticalUser(LocalDateTime startDate, LocalDateTime endDate, List<Integer> roles);
    @Query(value = "SELECT d from UserCommon d WHERE (d.role IN :roles) AND (d.rating IN :ratings) AND (d.phone LIKE %:keySearch% OR LOWER(d.name) LIKE %:keySearch% OR LOWER(d.email) LIKE %:keySearch%) ORDER BY d.id desc")
    Page<UserCommon> findUsers(String keySearch, List<Integer> roles, List<Integer> ratings, Pageable pageable);

    // Query dùng khi không có keySearch
    @Query("SELECT d FROM UserCommon d WHERE d.role IN :roles AND d.rating IN :ratings ORDER BY d.id DESC")
    Page<UserCommon> findUsers(List<Integer> ratings, List<Integer> roles, Pageable pageable);

    // Query dùng khi có keySearch (tìm theo tên/email hoặc trường nào bạn muốn)
    @Query("SELECT d FROM UserCommon d WHERE " +
            "(LOWER(d.name) LIKE :keySearch OR LOWER(d.email) LIKE :keySearch) " +
            "AND d.role IN :roles AND d.rating IN :ratings " +
            "ORDER BY d.id DESC")
    Page<UserCommon> findUsersByKeySearch(String keySearch, List<Integer> ratings, List<Integer> roles, Pageable pageable);

    List<UserCommon> findByRole(Integer role);
    @Query("SELECT u.role, YEAR(u.creationDate), COUNT(u) " +
            "FROM UserCommon u " +
            "WHERE u.role IN :roles AND u.active = 1 " +
            "GROUP BY u.role, YEAR(u.creationDate)")
    List<Object[]> countUsersByRoleAndYear(@Param("roles") List<Integer> roles);

    @Query("SELECT DISTINCT YEAR(u.creationDate) " +
            "FROM UserCommon u " +
            "WHERE u.active = 1 " +
            "ORDER BY YEAR(u.creationDate)")
    List<Integer> findDistinctYears();

    /**
     * Get standout users (by role) with points >= :minPoint, sorted by points desc (and rating desc), paged.
     */
    @Query(value = "SELECT DISTINCT ON (w.totalpoint, uc.rating, uc.id) " +
            "f.id as id, uc.name as name, uc.phone as phone, uc.email as email, uc.rating as rating, " +
            "uc.address as address, uc.province as province, uc.ward as ward, w.totalpoint as point " +
            "FROM usercommon uc " +
            "INNER JOIN wallet w ON uc.id = w.userid " +
            "INNER JOIN freelancer f ON uc.id = f.userid " +
            "WHERE uc.role = :role " +
            "ORDER BY w.totalpoint DESC, uc.rating DESC, uc.id ASC",
            countQuery = "SELECT COUNT(DISTINCT uc.id) FROM usercommon uc " +
                    "INNER JOIN wallet w ON uc.id = w.userid " +
                    "INNER JOIN freelancer f ON uc.id = f.userid " +
                    "WHERE uc.role = :role",
            nativeQuery = true)
    Page<StandoutUserProjection> findStandoutUsersByPointAndRole(@Param("role") Integer role, Pageable pageable);

    @Query("SELECT u FROM UserCommon u "
        + "WHERE u.isPremium = true AND u.premiumExpDate < :now")
    List<UserCommon> findExpiredUsers(@Param("now") LocalDateTime now);

    @Query("SELECT u.id, u.email FROM UserCommon u")
    List<Object[]> getAllUserEmails();

    @Query("SELECT new com.resourceservice.dto.RecruiterJob(u.id, j.id, j.name, u.email) "
        + "FROM Job j JOIN UserCommon u "
        + "ON j.userCommon.id = u.id "
        + "WHERE u.role = 2 "
        + "AND j.expDate BETWEEN CURRENT_DATE() AND CURRENT_DATE() + 2")
    List<RecruiterJob> getRecruiterJobs();
}
