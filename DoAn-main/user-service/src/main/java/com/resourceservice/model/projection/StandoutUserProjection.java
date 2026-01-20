package com.resourceservice.model.projection;

import java.math.BigDecimal;

public interface StandoutUserProjection {
    Long getId();
    String getName();
    String getPhone();
    String getEmail();
    Integer getRating();
    String getAddress();
    String getProvince();
    String getWard();
    BigDecimal getPoint();
}



