package com.jober.searchservice.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Where;

@Setter
@Getter
@Entity
@Table(name = "usercommon")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Where(clause = "active = 1")
public class UserCommon implements Serializable {
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

    @Transient
    private BigDecimal bonusPoint;

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
    private Integer sendSmsNumber;

    @Column(name = "creationdate")
    private LocalDateTime creationDate;
    @Column(name = "updatedate")
    private LocalDateTime updateDate;
    @Column(name = "dateofbirth")
    private LocalDateTime dateOfBirth;
    @Column(name = "country")
    private String country;
    @Column(name = "nationality")
    private String nationality;
    @Column(name = "detailaddress")
    private String detailAddress;
    @Column(name = "premiumexpdate")
    private LocalDateTime premiumExpDate;
    @Column(name = "name")
    private String name;
    @Column(name = "gender")
    private String gender;
    @Column(name = "address")
    private String address;
    @Column(name = "jobtarget")
    private String jobTarget;
    @Column(name = "experience")
    private String experience;
    @Size(max = 255)
    @Column(name = "province")
    private String province;
    @Size(max = 255)
    @Column(name = "ward")
    private String ward;
    @Column(name = "organizationid")
    private Long organizationId;
    @Column(name = "packageid")
    private Long packageId;
    @Column(name = "active")
    private Integer active;

    @Column(name = "ispremium")
    private Boolean isPremium;
}
