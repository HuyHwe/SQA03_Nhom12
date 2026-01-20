package com.jober.searchservice.model;

import lombok.*;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@Table(name = "organization")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Where(clause = "active = 1")
public class Organization implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "des")
    private String description;

    @Column(name = "creationdate")
    private LocalDateTime creationDate;

    @Column(name = "updatedate")
    private LocalDateTime updateDate;

    @Column(name = "active")
    private Integer active;

    @Column(name = "avatar")
    private String avatar;

    @Column(name = "province")
    private String province;

    @Column(name = "ward")
    private String ward;

    @Column(name = "website")
    private String website;

    @Column(name = "industry")
    private String industry;

}
