package com.jober.searchservice.repository;

import com.jober.searchservice.model.Province;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ProvinceRepo<T, ID> extends JpaRepository<Province, ID> {
    @Query(value = "SELECT d from Province d ")
    List<Province> findAll();
}
