package com.resourceservice.dto;

import com.jober.utilsservice.model.PageableModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDateTime;
import java.util.List;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UserCommonDTO implements Serializable {
    private Long id;
    private String phone;
    private String name;
    private String address;
    private Integer role;
    private List<Integer> roles;
    private String avatar;
    private String status;
    private Double totalMoney;
    private Integer rating;
    private String introPhone;
    private String email;
    private String facebookId;
    private String userType;
    private String statisticalType;
    private PageableModel pageableModel;
    private LocalDateTime startYear;
    private LocalDateTime endYear;
//    private Integer pin;
    private String actionType;
    private BigDecimal bonusPoint;
    private LocalDateTime creationDate;
    private LocalDateTime updateDate;
    private String province;
    private String ward;
    private String detailAddress;
    private String gender;
    private String jobTarget;
    private String experience;
    private LocalDateTime dateOfBirth;
    private Long organizationId;
}
