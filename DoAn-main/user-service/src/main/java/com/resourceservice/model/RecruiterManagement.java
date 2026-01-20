package com.resourceservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@Table(name = "recruitermanagement")
@AllArgsConstructor
@NoArgsConstructor
@Where(clause = "active = 1")
public class RecruiterManagement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid", nullable = false)
    private UserCommon userCommon;

    @NotNull
    @Column(name = "freelancerid", nullable = false)
    private Long freelancerid;

    @Size(max = 255)
    @Column(name = "status")
    private String status;

    @Size(max = 255)
    @Column(name = "note")
    private String note;

    @Column(name = "ratingstar")
    private Integer ratingstar;

    @Column(name = "comment")
    private String comment;

    @Column(name = "creationdate")
    private LocalDateTime creationdate;

    @Column(name = "updatedate")
    private LocalDateTime updatedate;

    @Column(name = "active")
    private Integer active;
}
