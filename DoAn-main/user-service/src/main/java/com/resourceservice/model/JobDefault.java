package com.resourceservice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Table(name = "jobdefault")
@Builder
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Where(clause = "active = 1")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class JobDefault implements Serializable {
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
    @Column(name = "creationdate")
    private LocalDateTime creationDate;
    @Column(name = "updatedate")
    private LocalDateTime updateDate;
    @Column(name = "active")
    private Integer active;
}
