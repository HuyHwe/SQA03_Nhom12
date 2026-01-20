package com.paymentservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.hibernate.annotations.Type;

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
@Table(name = "job")
public class Job implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 255)
    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 255)
    @NotNull
    @Column(name = "job", nullable = false)
    private String job;

    @Size(max = 255)
    @Column(name = "birthyear")
    private String birthyear;

    @Size(max = 255)
    @Column(name = "gender")
    private String gender;

    @NotNull
    @Column(name = "lat", nullable = false)
    private Double lat;

    @NotNull
    @Column(name = "lon", nullable = false)
    private Double lng;

    @Size(max = 255)
    @Column(name = "phone")
    private String phone;

    @Size(max = 255)
    @Column(name = "email")
    private String email;

    @Column(name = "expdate")
    private LocalDateTime expdate;

    @Column(name = "number")
    private Integer number;

    @Size(max = 255)
    @Column(name = "address")
    private String address;

    @Column(name = "des")
    @Type(type = "org.hibernate.type.TextType")
    private String des;

    @Size(max = 255)
    @Column(name = "cv")
    private String cv;

    @Column(name = "active")
    private Integer active;

    @Column(name = "level")
    private Integer level;

    @Size(max = 255)
    @Column(name = "img")
    private String img;

    @Size(max = 255)
    @Column(name = "website")
    private String website;

    @Size(max = 255)
    @Column(name = "type")
    private String type;

    @Column(name = "creationdate")
    private LocalDateTime creationdate;

    @Column(name = "updatedate")
    private LocalDateTime updatedate;

    @Size(max = 200)
    @Column(name = "salary", length = 200)
    private String salary;

    @Size(max = 10)
    @Column(name = "status", length = 10)
    private String status;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid")
    private UserCommon userCommon;
}