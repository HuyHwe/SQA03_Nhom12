package com.configurationservice.model;
import lombok.Data;
import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Table(name = "package")
@Entity
public class Package implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    @Column(name = "type")
    private Integer type;
    @Column(name = "price")
    private Double price;
    @Column(name = "creationdate")
    private LocalDateTime creationDate;
    @Column(name = "updatedate")
    private LocalDateTime updateDate;
}
