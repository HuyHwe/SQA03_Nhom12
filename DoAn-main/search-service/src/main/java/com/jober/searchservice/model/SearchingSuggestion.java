package com.jober.searchservice.model;

import lombok.*;
import org.springframework.context.annotation.Primary;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "searchingsuggestion")
public class SearchingSuggestion implements Serializable {
    public SearchingSuggestion(String val, String object, Integer rank, LocalDateTime creationDate, LocalDateTime updateDate) {
        this.val = val;
        this.object = object;
        this.rank = rank;
        this.creationDate = creationDate;
        this.updateDate = updateDate;
    }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    @Column(name = "val")
    private String val;
    @Column(name = "rank")
    private Integer rank;
    @Size(max = 10)
    @Column(name = "object")
    private String object;
    @Column(name = "creationdate")
    private LocalDateTime creationDate;
    @Column(name = "updatedate")
    private LocalDateTime updateDate;
}