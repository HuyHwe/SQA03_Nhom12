package com.jober.searchservice.model;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@Table(name = "district")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
public class District implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;
    @Size(max = 255)
    @Column(name = "name")
    private String name;
    @Size(max = 255)
    @Column(name = "provincecode")
    private String provinceCode;
    @Size(max = 255)
    @Column(name = "code")
    private String code;
    @Column(name = "isactive")
    private Boolean isActive;
    @Column(name = "createdat")
    private LocalDateTime createAt;
    @Column(name = "updatedat")
    private LocalDateTime updateAt;
    @Lob
    @Type(type = "jsonb")
    @Column(name = "createdby", columnDefinition = "jsonb")
    private String createdBy;

    @Column(name = "providers")
    private String provider;

    @Column(name = "lat")
    private Double lat;

    @Column(name = "lng")
    private Double lng;
}
