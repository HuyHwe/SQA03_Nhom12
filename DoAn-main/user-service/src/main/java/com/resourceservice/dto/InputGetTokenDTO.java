package com.resourceservice.dto;

import lombok.*;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
public class InputGetTokenDTO {
    private String username;
    private String password;
}
