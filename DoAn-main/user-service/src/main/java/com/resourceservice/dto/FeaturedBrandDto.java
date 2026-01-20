package com.resourceservice.dto;

import lombok.*;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FeaturedBrandDto implements Serializable {
    
    private Long id;
    private String name;
    private String avatar;
    private String industry;
    private Long jobCount;
    private String description;
    private Boolean isProCompany;
    
}
