package com.resourceservice.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
@Builder
public class StandoutUserDto implements Serializable {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private Integer rating;
    private String address;
    private String province;
    private String ward;
    private Long point;

}


