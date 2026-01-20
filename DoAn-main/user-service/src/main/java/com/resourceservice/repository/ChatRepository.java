package com.resourceservice.repository;

import com.resourceservice.dto.ChatLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatRepository<T, ID> extends JpaRepository<ChatLog, ID> {

    @Query(value = "SELECT c " +
            "FROM ChatLog c " +
            "WHERE c.sender = :userId " +
            "ORDER BY c.id DESC")
    Page<ChatLog> getNearest(@Param("userId") Integer userId, Pageable pageable);
}
