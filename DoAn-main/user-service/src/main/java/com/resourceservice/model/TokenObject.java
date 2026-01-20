package com.resourceservice.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.io.Serializable;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TokenObject implements Serializable {
    @JsonProperty("access_token")
    private String accessToken;
}
