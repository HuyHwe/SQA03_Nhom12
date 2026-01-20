package com.oauth2jwt.authorizationresourceserver.model;

import com.sun.istack.NotNull;

import javax.persistence.*;

import javax.validation.constraints.Size;
import java.time.Instant;

@Entity
@Table(name = "d_note")
public class DNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @Column(name = "datecreate", nullable = false)
    private Instant datecreate;

    @NotNull
    @Column(name = "freelancer_id", nullable = false)
    private Long freelancerId;

    @Size(max = 255)
    @NotNull
    @Column(name = "note", nullable = false)
    private String note;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;
}