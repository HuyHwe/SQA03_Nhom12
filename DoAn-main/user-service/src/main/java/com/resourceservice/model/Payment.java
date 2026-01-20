package com.resourceservice.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "payment")
@Where(clause = "active = 1")
public class Payment implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid", nullable = false)
    private UserCommon userCommon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jobid", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancerid", nullable = false)
    private Freelancer freelancer;
    @Size(max = 255)
    @NotNull
    @Column(name = "note", nullable = false)
    private String note;
    @Column(name = "totalmoney")
    private Double totalMoney;
    @Column(name = "creationdate")
    private LocalDateTime creationdate;
    @Column(name = "updatedate")
    private LocalDateTime updatedate;
    @Column(name = "active")
    private Integer active;
}
