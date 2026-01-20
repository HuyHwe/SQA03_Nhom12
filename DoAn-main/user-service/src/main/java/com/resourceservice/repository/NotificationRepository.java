package com.resourceservice.repository;

import com.resourceservice.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdAndRole(Long userId, String role);
    List<Notification> findByRole(String role);
}
