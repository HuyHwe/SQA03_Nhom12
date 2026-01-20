package com.resourceservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyPostDto {

    private Long id;

    private String name;

    private String job;

    private String salary;

    private String des;

    private String address;

    private String cv;

    private Integer active;

    private LocalDateTime creationdate;

    private LocalDateTime expdate;
}
