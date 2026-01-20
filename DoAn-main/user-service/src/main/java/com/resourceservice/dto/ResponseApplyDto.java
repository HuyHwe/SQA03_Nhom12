package com.resourceservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@NoArgsConstructor
public class ResponseApplyDto {

    private String name;

    private String phone;

    private LocalDateTime creationdate;

    public ResponseApplyDto(String name, String phone, LocalDateTime creationdate) {
        this.name = name;
        this.phone = phone;
        this.creationdate = creationdate;
    }
}
