package com.oauth2jwt.authorizationresourceserver.model;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.Size;

import java.time.LocalDate;

@Setter
@Getter
@Entity
@Table(name = "usercommon")
public class UserCommon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 255)
    @Column(name = "phone")
    private String phone;

    @Size(max = 255)
    @Column(name = "pin")
    private String pin;

    @Size(max = 255)
    @Column(name = "status")
    private String status;

    @Column(name = "totalmoney")
    private Double totalMoney;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "role")
    private Integer role;

    @Column(name = "loginnumber")
    private Long loginNumber;

    @Column(name = "withdrawnumber")
    private Integer withdrawNumber;

    @Size(max = 255)
    @Column(name = "introphone")
    private String introPhone;

    @Column(name = "bonuspoint")
    private Double bonusPoint;

    @Size(max = 255)
    @Column(name = "email")
    private String email;

    @Size(max = 255)
    @Column(name = "avatar")
    private String avatar;

    @Column(name = "sentpassword")
    private Integer sentPassword;

    @Size(max = 200)
    @Column(name = "facebookid", length = 200)
    private String facebookId;

    @Size(max = 255)
    @Column(name = "googleid")
    private String googleId;

    @Column(name = "receiveinfo")
    private Integer receiveInfo;

    @Column(name = "sendsmsnumber")
    private Integer sendsmsNumber;

    @Column(name = "creationdate")
    private LocalDate creationDate;

    @Column(name = "updatedate")
    private LocalDate updateDate;
    
    @Column(name = "ispremium")
    private Boolean isPremium;
}