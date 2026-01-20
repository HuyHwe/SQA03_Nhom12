package com.configurationservice.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
@Getter
@Setter
@Entity
@Table(name = "jobdefault")
@Where(clause = "active = 1")
public class JobDefault {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    @Size(max = 255)
    @Column(name = "des")
    private String des;
    @Size(max = 255)
    @Column(name = "name")
    private String name;
    @Column(name = "parentid")
    private Long parentId;
    @Column(name = "icon")
    private String icon;
    @Column(name = "creationdate")
    private LocalDateTime creationDate;
    @Column(name = "updatedate")
    private LocalDateTime updateDate;
    @Column(name = "active")
    private Integer active;
}
