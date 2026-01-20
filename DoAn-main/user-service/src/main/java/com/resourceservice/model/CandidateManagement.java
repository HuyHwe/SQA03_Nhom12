package com.resourceservice.model;

import lombok.*;
import org.hibernate.annotations.Where;
import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "candidatemanagement")
@Where(clause = "active = 1")
public class CandidateManagement implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid", nullable = false)
    private UserCommon userCommon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jobid")
    private Job job;

    @Size(max = 255)
    @NotNull
    @Column(name = "status", nullable = false)
    private String status;

    @Size(max = 255)
    @Column(name = "note")
    private String note;

    @Column(name = "creationdate")
    private LocalDateTime creationdate;

    @Column(name = "updatedate")
    private LocalDateTime updatedate;

    @Column(name = "ratingstar")
    private int ratingStar;

    @Column(name = "comment")
    private String comment;

    @Column(name = "active")
    private Integer active;
}
