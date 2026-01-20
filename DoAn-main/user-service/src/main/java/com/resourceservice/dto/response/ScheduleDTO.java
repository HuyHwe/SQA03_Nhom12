package com.resourceservice.dto.response;

import com.resourceservice.model.Address;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleDTO extends ScheduleRpDTO {
    private String organizationName;
    private String defaultJobName;
}
