package com.resourceservice.dto.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserForChangingPass {
    private String pass;
    private String phone;
}
