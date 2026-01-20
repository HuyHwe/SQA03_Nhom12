package com.resourceservice.dto.request;

import com.jober.utilsservice.utils.modelCustom.Coordinates;
import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.SearchInput;
import com.jober.utilsservice.utils.modelCustom.SortItem;
import com.resourceservice.utilsmodule.utils.modelCustom.SearchInputCommon;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class CandidateInputDTO extends SearchInputCommon {
    private List<Long> ids;
    private String keySearch;
    private List<Long> jobDefaultIds;
    @NotNull
    private Coordinates coordinates;
}
