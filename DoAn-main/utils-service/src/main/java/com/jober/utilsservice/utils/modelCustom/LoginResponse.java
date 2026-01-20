package com.jober.utilsservice.utils.modelCustom;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String accessToken;
    private String tokenType;
    public LoginResponse(String accessToken) {
        this.accessToken = accessToken;
    }
}
