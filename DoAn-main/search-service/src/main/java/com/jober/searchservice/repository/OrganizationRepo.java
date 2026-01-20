package com.jober.searchservice.repository;

import com.jober.searchservice.dto.RecruiterCompany;
import com.jober.searchservice.model.Organization;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrganizationRepo extends JpaRepository<Organization, Long> {
    Optional<Organization> findById(Long id);
    @Query(value = "SELECT s FROM Organization s  WHERE LOWER(s.name) LIKE %:name%  ORDER BY s.id DESC")
    Page<Organization> findByName(String name, Pageable pageable);
    Organization findByName(String name);

  @Query(value = "SELECT new com.jober.searchservice.dto.RecruiterCompany(u.name, u.email, u.phone, o.name, rc.status) "
      + "FROM Organization o JOIN UserCommon u ON u.organizationId = o.id "
      + "JOIN RecruiterConfiguration rc ON rc.cusId = u.id "
      + "WHERE (:companyName IS NULL OR o.name LIKE %:companyName%)")
    List<RecruiterCompany> getAllRecruiter(String companyName);
}
