package com.configurationservice.repository;

import com.configurationservice.model.JobDefault;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface JobDefaultRepo<T, ID> extends JpaRepository<JobDefault, ID> {
    @Query("SELECT j FROM JobDefault j WHERE (j.parentId IS NULL) ORDER BY j.id DESC" )
    Page<JobDefault> getListJobDefault(Pageable pageable);
    @Query("SELECT j FROM JobDefault j WHERE (j.parentId IS NULL) ORDER BY j.id DESC" )
    List<JobDefault> getListJobDefault();
    @Modifying
    @Query("DELETE FROM JobDefault j WHERE j.id IN :ids")
    Integer deleteJobDefault(List<Long> ids);
    @Query(value = "SELECT j FROM JobDefault j WHERE j.name = :name")
    JobDefault getJobDefault(String name);
    @Query(value = "SELECT j FROM JobDefault j WHERE j.id IN :ids")
    Page<JobDefault> getListJobDefaultByIds(List<Long> ids, Pageable pageable);
    @Query("SELECT j FROM JobDefault j\n" +
            "WHERE j.id NOT IN (\n" +
            "    SELECT DISTINCT parentId\n" +
            "    FROM JobDefault\n" +
            "    WHERE parentId IS NOT NULL\n" +
            ")\n" +
            "ORDER BY j.id DESC")
    Page<JobDefault> getListJobChildren(Pageable pageable);
    @Query("SELECT j FROM JobDefault j\n" +
            "            WHERE j.id NOT IN (\n" +
            "            SELECT DISTINCT parentId\n" +
            "                FROM JobDefault\n" +
            "                WHERE parentId IS NOT NULL\n" +
            "            ) And LOWER(j.name) LIKE %:keySearch%\n" +
            "            ORDER BY j.id DESC")
    Page<JobDefault> getListJobChildrenByName(String keySearch, Pageable pageable);

    @Query("SELECT j FROM JobDefault j\n" +
            "            WHERE j.id NOT IN (\n" +
            "            SELECT DISTINCT parentId\n" +
            "                FROM JobDefault\n" +
            "                WHERE parentId IS NOT NULL\n" +
            "            ) And LOWER(j.name) LIKE %:keySearch%\n" +
            "            AND j.id NOT IN :ids" +
            "            ORDER BY j.id DESC")
    Page<JobDefault> getListJobDefaultNoPost(String keySearch, List<Integer> ids, Pageable pageable);
    @Query(value = "SELECT id FROM jobdefault WHERE parentid IS NULL OR parentid = 0", nativeQuery = true)
List<Long> findAllRootIds();

}
