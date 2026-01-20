package com.configurationservice.dto.input;

import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.SortItem;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class JobDefaultInputDTO {
    @NotNull
    private List<Long> parentIds;
    private String keySearch;
    @NotNull
    private Paging paging;
    private SortItem sort;
}
