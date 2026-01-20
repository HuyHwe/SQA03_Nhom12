package com.resourceservice.model;

import lombok.*;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "wallet")
@Where(clause = "active = 1")
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "userid")
    private Long userId;

    @Column(name = "totalmoney")
    private BigDecimal totalMoney;

    @Column(name = "totalpoint")
    private BigDecimal totalPoint;

    @Column(name = "bankaccount")
    private String bankAccount;

    @Column(name = "creationdate")
    private LocalDateTime creationdate;

    @Column(name = "updatedate")
    private LocalDateTime updatedate;

    @Column(name = "active")
    private Integer active;
}
