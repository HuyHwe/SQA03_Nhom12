package com.resourceservice.dto;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class CandidateManagementDTO {
    private Long id;

    private Long userId;

    private Long jobId;

    private String status;

    private String note;

    private Integer active;

    private LocalDateTime creationDate;

    private LocalDateTime updateDate;
}
