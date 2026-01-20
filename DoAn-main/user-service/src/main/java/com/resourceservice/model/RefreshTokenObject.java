package com.resourceservice.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.io.Serializable;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RefreshTokenObject implements Serializable {
    @JsonProperty("refresh_token")
    private String refreshToken;
}
