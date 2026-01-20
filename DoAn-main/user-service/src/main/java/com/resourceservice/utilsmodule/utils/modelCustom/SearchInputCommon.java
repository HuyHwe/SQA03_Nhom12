package com.resourceservice.utilsmodule.utils.modelCustom;

import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.SortItem;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class SearchInputCommon {
    private SortItem sortItem;
    private Paging paging;
}
