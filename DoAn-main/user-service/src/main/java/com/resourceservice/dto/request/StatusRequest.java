package com.resourceservice.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StatusRequest {
    private List<String> status;
    public StatusRequest(@JsonProperty("status") List<String> status) {
        this.status = status;
    }
    @JsonProperty("status")
    public List<String> getStatus() {
        return status;
    }

    @JsonProperty("status")
    public void setStatus(List<String> status) {
        this.status = status;
    }
}