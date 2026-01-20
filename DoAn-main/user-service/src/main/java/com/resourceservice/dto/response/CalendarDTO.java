package com.resourceservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CalendarDTO {
    private Long id;
    private String jobCategory;
    private String jobType;
    private String status;
    private String province;
    private String ward;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
