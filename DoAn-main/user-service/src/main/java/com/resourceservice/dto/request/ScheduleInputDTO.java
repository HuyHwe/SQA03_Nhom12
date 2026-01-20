package com.resourceservice.dto.request;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ScheduleInputDTO implements Serializable {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<String> statuses;
}
