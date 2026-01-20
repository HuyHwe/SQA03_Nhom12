package com.resourceservice.repository;

import com.resourceservice.model.Settings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface SettingsRepo<T, ID> extends JpaRepository<Settings, ID> {
    @Query("UPDATE Settings s SET s.data = :data  WHERE s.keywords = :keywords")
    Settings save(String data, String keywords);
    @Query("SELECT s from Settings s WHERE s.keywords = :keyword")
    List<Settings> findSetting(String keyword);
    @Modifying
    @Query("UPDATE Settings s SET s.data = :data WHERE s.keywords = :keyword")
    Integer updateSettings(String data, String keyword);
}
