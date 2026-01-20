package com.resourceservice.dto.request;

import com.jober.utilsservice.model.PageableModel;
import com.resourceservice.utilsmodule.utils.modelCustom.SearchInputCommon;
import lombok.Getter;
import lombok.Setter;
import org.springdoc.core.converters.models.Pageable;

import java.util.List;

@Getter
@Setter
public class UserParamDTO extends SearchInputCommon {
    private String keySearch;
    private String email;
    private String phone;
    private List<Integer> roles;
    private List<Integer> ratings;
}
