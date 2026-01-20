package com.resourceservice.dto;

import lombok.*;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StandoutOrganizationDto implements Serializable {
    private Long id;
    private String name;
    private String avatar;
    private Long postCount;
    private String industry;
}



