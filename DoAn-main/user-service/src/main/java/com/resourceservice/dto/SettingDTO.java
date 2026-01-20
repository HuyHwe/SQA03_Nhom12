package com.resourceservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class SettingDTO {
    private Long id;
    private String activefee;
    private String feePerSelectOneFreelancer;
    private String userRole;
    private String userPhone;
    private String language;
}
