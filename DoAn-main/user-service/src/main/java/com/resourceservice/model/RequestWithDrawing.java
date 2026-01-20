package com.resourceservice.model;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "requestwithdrawing")
public class RequestWithDrawing implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "bonuspoint")
    private double bonusPoint;

    @Column(name = "conversionrate")
    private Long conversionRate;

    @Column(name = "receivemoney")
    private double receiveMoney;

    @Size(max = 255)
    @Column(name = "phone")
    private String phone;

    @Size(max = 255)
    @Column(name = "bankaccount")
    private String bankAccount;

    @Column(name = "status")
    private String status;
    @Size(max = 255)
    @Column(name = "otherreason")
    private String otherReason;

    @Column(name = "creationdate")
    private LocalDateTime creationDate;

    @Column(name = "updatedate")
    private LocalDateTime updateDate;
}
