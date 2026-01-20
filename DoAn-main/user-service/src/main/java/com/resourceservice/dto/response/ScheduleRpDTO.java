package com.resourceservice.dto.response;
import com.resourceservice.model.Address;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleRpDTO extends Address {
    private Long id;
    private Long jobId;
    private String status;
    private String jobName;
    /**
     * job exp date
     */
    private LocalDateTime expDate;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String userName;
    private Long userId;
    private Long organizationId;
    private String meetUrl;
    private String meetId;
    private String passcode;
    private boolean interviewMethod;
    public ScheduleRpDTO(Long id, Long jobId, String status, String jobName,
                         LocalDateTime expDate, String province, String ward,
                         LocalDateTime startDate, LocalDateTime endDate, String userName,
                         Long userId, Long organizationId) {
        super(province, ward);
        this.id = id;
        this.jobId = jobId;
        this.status = status;
        this.jobName = jobName;
        this.expDate = expDate;
        this.startDate = startDate;
        this.endDate = endDate;
        this.userName = userName;
        this.userId = userId;
        this.organizationId = organizationId;
    }
}
