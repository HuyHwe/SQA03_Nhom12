package com.jober.utilsservice.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OrgInputDTO {
    private Long id;
    private String name;
    private String des;
    private LocalDateTime foundedDate;
}
