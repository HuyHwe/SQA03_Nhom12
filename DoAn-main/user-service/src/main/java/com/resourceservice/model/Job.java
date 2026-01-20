package com.resourceservice.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDateTime;
@Getter
@Setter
@Entity
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "job")
@Where(clause = "active = 1")
public class Job implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

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
    private LocalDateTime expDate;


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
    private LocalDateTime creationDate;

    @Column(name = "updatedate")
    private LocalDateTime updateDate;

    @Size(max = 200)
    @Column(name = "salary", length = 200)
    private String salary;

    @Size(max = 255)
    @Column(name = "province")
    private String province;
    @Size(max = 255)
    @Column(name = "ward")
    private String ward;

    @Column(name = "workingtype")
    private Integer workingType;

    @Column(name = "requiredexperiencelevel")
    private Integer requiredExperienceLevel;

    @Column(name = "requiredskilllevel")
    private Integer requiredSkillLevel;

    @Size(max = 255)
    @Column(name = "profit")
    private String profit;

    @Size(max = 255)
    @Column(name = "requiredskill")
    private String requiredSkill;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "userid")
    private UserCommon userCommon;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "jobdefaultid", nullable = true)
    private JobDefault jobDefault;

    @Column(name = "organizationid")
    private Long organizationId;

    @Transient
    private float[] embedding;


}
