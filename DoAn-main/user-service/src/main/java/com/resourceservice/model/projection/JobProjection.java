package com.resourceservice.model.projection;

import java.time.LocalDateTime;

public interface JobProjection extends AddressProjection {
    Long getId();
    Long getJdId();
    String getJname();
    String getJobDefaultName();
    String getDes();
    String getSalary();
    LocalDateTime getCreationDate();
    LocalDateTime getExpDate();
    String getStatus();
}
