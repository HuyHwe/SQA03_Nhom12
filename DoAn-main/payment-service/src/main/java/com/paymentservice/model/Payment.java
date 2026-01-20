package com.paymentservice.model;

import com.paymentservice.utilsmodule.constant.PaymentStatus;
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
@Table(name = "payment")
@Where(clause = "active = 1")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment implements Serializable {
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancerid")
    private Freelancer freelancer;

    @Size(max = 255)
    @NotNull
    @Column(name = "note", nullable = false)
    private String note;

    @Column(name = "totalmoney")
    private Long totalMoney;

    @Column(name = "creationdate")
    private LocalDateTime creationDate;

    @Column(name = "updatedate")
    private LocalDateTime updateDate;

    @Column(name = "active")
    private Integer active;

    @Column(name = "orderid")
    private String orderId;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Column(name = "transferedpoint")
    private Long transferPoint;

    @PrePersist
    public void prePersist() {
        creationDate = LocalDateTime.now();
        updateDate = creationDate;
    }

    @PreUpdate
    public void preUpdate() {
        updateDate = LocalDateTime.now();
    }
}
