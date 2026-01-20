package com.resourceservice.model;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import lombok.*;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@TypeDefs({
        @TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
})

@Table(name = "freelancer")
@Where(clause = "active = 1")
public class Freelancer implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "userid")
    private UserCommon userCommon;

    @Column(name = "jobdefaultid")
    private Long jobDefaultId;

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

    @Size(max = 255)
    @Column(name = "experiencedes")
    private String experienceDes;

    @Size(max = 255)
    @Column(name = "skilldes")
    private String skillDes;

    @Column(name = "ratingavr")
    private Integer ratingavr;

//    Note: LocalDate is origin, I let it to LocalDateTime
    @Column(name = "creationdate")
    private LocalDateTime creationDate;

    @Column(name = "updatedate")
    private LocalDateTime updatedate;

    @Size(max = 200)
    @Column(name = "salary", length = 200)
    private String salary;

    @Size(max = 255)
    @Column(name = "ward")
    private String ward;

    @Size(max = 255)
    @Column(name = "province")
    private String province;

    @Column(name = "jobtarget")
    private String jobTarget;
    @Column(name ="experiencelevel")
    private Integer experienceLevel;

    @Column(name ="skilllevel")
    private Integer skillLevel;

    @Transient
    private String embedding;

    @Column(name = "math_score")
    private Integer matchScore;


    @Column(name = "reasons")
    private String reasons;

    @Column(name = "similarity_score")
    private Float similarityScore;

    @Column(name = "gnn_score")
    private Float gnnScore;

    @Column(name = "behavior_boost")
    private Float behaviorBoost;

    @Column(name = "job_id")
    private Long jobId;

    @Type(type = "jsonb")
    @Column(name = "cv_embedding", columnDefinition = "jsonb")
    private List<Float> cvEmbedding;

    @Column(name = "score")
    private Float score;
    public Freelancer(Long userId, Long jobDefaultId){
        UserCommon userCommon = new UserCommon();
        userCommon.setId(userId);
        this.userCommon = userCommon;
        this.jobDefaultId = jobDefaultId;
    }
}
