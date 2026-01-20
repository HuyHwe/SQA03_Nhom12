package com.paymentservice.model;

import lombok.*;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "freelancer")
public class Freelancer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid")
    private UserCommon userCommon;

    @Size(max = 255)
    @Column(name = "name")
    private String name;

    @Size(max = 255)
    @Column(name = "job")
    private String job;

    @Size(max = 255)
    @Column(name = "birthyear")
    private String birthyear;

    @Size(max = 255)
    @Column(name = "gender")
    private String gender;

    @Column(name = "des")
    @Type(type = "org.hibernate.type.TextType")
    private String des;

    @Size(max = 255)
    @Column(name = "address")
    private String address;

    @Column(name = "lat")
    private double lat;

    @Column(name = "lon")
    private double lng;

    @Size(max = 255)
    @Column(name = "cv")
    private String cv;

    @Column(name = "active")
    private Integer active;

    @Size(max = 255)
    @Column(name = "workingtype")
    private String workingtype;

    @Column(name = "status")
    private Integer status;

    @Size(max = 255)
    @Column(name = "img")
    private String img;

    @Size(max = 255)
    @Column(name = "phone")
    private String phone;

    @Size(max = 255)
    @Column(name = "email")
    private String email;

    @Column(name = "ratingavr")
    private Integer ratingavr;

//    Note: LocalDate is origin, I let it to LocalDateTime
    @Column(name = "creationdate")
    private LocalDateTime creationdate;

    @Column(name = "updatedate")
    private LocalDateTime updatedate;

    @Size(max = 200)
    @Column(name = "salary", length = 200)
    private String salary;

}