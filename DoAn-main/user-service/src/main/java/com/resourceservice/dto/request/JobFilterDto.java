package com.resourceservice.dto.request;

import com.resourceservice.utilsmodule.utils.modelCustom.Paging;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobFilterDto {
    private String organizationId;
    private String jobId;
    private Paging paging;
}
