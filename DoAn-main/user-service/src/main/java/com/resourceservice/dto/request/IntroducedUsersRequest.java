package com.resourceservice.dto.request;

import com.jober.utilsservice.model.PageableModel;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class IntroducedUsersRequest {
    private String introPhone;
    private PageableModel pageableModel;
}
