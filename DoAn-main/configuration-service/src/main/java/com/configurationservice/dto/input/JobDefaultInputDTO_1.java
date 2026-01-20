package com.configurationservice.dto.input;

import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.SortItem;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class JobDefaultInputDTO_1 {
    @NotNull
    private List<Long> ids;
    @NotNull
    private Paging paging;
}
