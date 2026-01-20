package com.resourceservice.dto.request;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ScheduleRqDTO {
    private Long scheduleId;
    private Long freelancerId;
    private Long jobId;
    private String status;
    private String topic;
    private String des;
    private String address;
    private String interviewResult;
    private String feedback;
    private Integer type;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean interviewMethod;
    private String meetingId;
    private String meetUrl;
    private String passcode;
}
