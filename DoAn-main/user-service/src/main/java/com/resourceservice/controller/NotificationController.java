package com.resourceservice.controller;

import com.resourceservice.model.Notification;
import com.resourceservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("bs-user/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/{userId}/{role}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable Long userId, @PathVariable String role) {
        return ResponseEntity.ok(notificationService.getNotifications(userId, role));
    }

    @PostMapping("/mark-read/{notificationId}")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    // Endpoint mẫu để tạo thông báo (cho mục đích kiểm tra)
    @PostMapping("/send")
    public ResponseEntity<Void> sendNotification(
            @RequestParam Long userId,
            @RequestParam String role,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam String type,
            @RequestParam(required = false) String actionUrl,
            @RequestParam(required = false) Long senderId) {
        notificationService.sendNotification(userId, role, title, message, type, actionUrl, senderId);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/stats/{postId}")
    public ResponseEntity<Map<String, Long>> getNotificationStatsByPostId(@PathVariable Long postId) {
        return ResponseEntity.ok(notificationService.getNotificationStatsByPostId(postId));
    }
    @GetMapping("/stats/candidate/{candidateId}")
    public ResponseEntity<Map<String, Object>> getNotificationStatsByCandidateId(@PathVariable Long candidateId) {
        return ResponseEntity.ok(notificationService.getNotificationStatsByCandidateId(candidateId));
    }
}
