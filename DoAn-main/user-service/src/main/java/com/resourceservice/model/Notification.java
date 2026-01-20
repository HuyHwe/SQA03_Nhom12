package com.resourceservice.model;

import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String role;
    private String title;
    private String message;
    private String type;
    private String status; // UNREAD or READ
    private String createdAt;
    private String actionUrl;
    private Long senderId;
}
