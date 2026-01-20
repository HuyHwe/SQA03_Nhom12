package com.paymentservice.model;

import lombok.*;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "transactionhistory")
@Where(clause = "active = 1")
public class TransactionHistory implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "userid", nullable = false)
    private Long userId;

    @Column(name = "creationdate")
    private LocalDateTime creationDate;

    @Column(name = "updatedate")
    private LocalDateTime updateDate;

    @Column(name = "conversionrate")
    private BigDecimal conversionRate;

    @Column(name = "transferredmoney")
    private BigDecimal transferredMoney;

    @Column(name = "transferredpoint")
    private BigDecimal transferredPoint;

    @Column(name = "otherreason", length = 255)
    private String otherReason;

    @Column(name = "note", length = 255)
    private String note;

    @Column(name = "transfertype")
    private Integer transferType;

    @Column(name = "active")
    private Integer active;

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
