package com.resourceservice.dto.request;
import com.jober.utilsservice.utils.modelCustom.Coordinates;
import com.resourceservice.utilsmodule.utils.modelCustom.SearchInputCommon;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class JobParamDTO extends SearchInputCommon {
    private List<Long> ids;
    private String keySearch;
    private List<Long> parentIds;
    private List<Long> jobDefaultIds;
    private Coordinates coordinates;
}
