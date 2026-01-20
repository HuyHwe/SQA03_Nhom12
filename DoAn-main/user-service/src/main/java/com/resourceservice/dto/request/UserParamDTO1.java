package com.resourceservice.dto.request;

import com.resourceservice.utilsmodule.utils.modelCustom.Paging;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserParamDTO1 {
    private Long userId;
    private Paging paging;
}
