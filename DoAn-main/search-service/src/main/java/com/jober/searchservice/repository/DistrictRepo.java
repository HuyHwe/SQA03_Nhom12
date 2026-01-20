package com.jober.searchservice.repository;

import com.jober.searchservice.model.District;
import com.jober.searchservice.model.Province;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface DistrictRepo<T, ID> extends JpaRepository<District, ID> {
    @Query(value = "SELECT d from District d WHERE (d.provinceCode = :code) ORDER BY d.id desc")
    List<District> findByProvinceCode(String code);
}
