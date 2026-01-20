package com.resourceservice.repository;

import com.resourceservice.model.Organization;
import com.resourceservice.model.projection.StandoutOrganizationProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationRepo extends JpaRepository<Organization, Long> {
    @Query("SELECT o.id,o.name FROM Organization o")
    List<Object[]> findAllOrganizationIdAndName();
    @Query("SELECT o.id FROM Organization o WHERE o.name = :name")
    Long getIdByName(@Param("name") String name);

    Optional<Organization> findByName(String name);
    @Query(value = "SELECT o.id as id, o.name as name, o.avatar as avatar, " +
            "COUNT(j.id) as postCount, o.industry as industry " +
            "FROM organization o " +
            "LEFT JOIN job j ON o.id = j.organizationid AND j.active = 1 " +
            "WHERE o.active = 1 " +
            "AND (CAST(:industry AS varchar) IS NULL OR o.industry = CAST(:industry AS varchar)) " +
            "GROUP BY o.id, o.name, o.avatar, o.industry " +
            "ORDER BY COUNT(j.id) DESC",
            countQuery = "SELECT COUNT(*) FROM organization o " +
                    "WHERE o.active = 1 " +
                    "AND (CAST(:industry AS varchar) IS NULL OR o.industry = CAST(:industry AS varchar))",
            nativeQuery = true)
    Page<StandoutOrganizationProjection> findStandoutOrganizations(
            @Param("industry") String industry,
            Pageable pageable
    );
    @Query(value = "SELECT o.id as id, o.name as name, o.avatar as avatar, o.industry as industry, o.des as description, COUNT(j.id) as postCount " +
            "FROM organization o LEFT JOIN job j ON o.id = j.organizationid AND j.active = 1 " +
            "WHERE o.active = 1 " +
            "AND (:category IS NULL OR o.industry = :category) " +
            "GROUP BY o.id, o.name, o.avatar, o.industry, o.des " +
            "ORDER BY COUNT(j.id) DESC, o.id DESC",
            nativeQuery = true)
    org.springframework.data.domain.Page<com.resourceservice.model.projection.FeaturedBrandProjection> findFeaturedBrands(@Param("category") String category, org.springframework.data.domain.Pageable pageable);

    @Query(value = "SELECT DISTINCT o.industry FROM organization o WHERE o.active = 1 AND o.industry IS NOT NULL ORDER BY o.industry", nativeQuery = true)
    List<String> findDistinctCategories();

    // Đếm tất cả công ty đang active
    Long countByActive(Integer active);


}
