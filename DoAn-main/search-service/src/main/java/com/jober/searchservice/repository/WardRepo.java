package com.jober.searchservice.repository;

import com.jober.searchservice.model.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface WardRepo<T, ID> extends JpaRepository<Ward, ID> {
    @Query(value = "SELECT w from Ward w WHERE (w.provincecode = :code) ORDER BY w.id desc")
    List<Ward> findByProvinceCode(String code);
}
