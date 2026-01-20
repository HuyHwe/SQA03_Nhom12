package com.configurationservice.repository;

import com.configurationservice.model.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PackageRepo<T, ID> extends JpaRepository<Package, ID> {
    @Modifying
    @Query("DELETE FROM  Package p WHERE p.id IN :ids")
    Integer delete(List<Long> ids);

//    @Query("SELECT p FROM  Package p ORDER BY p.type")
    List<Package> findByOrderByType();
}
