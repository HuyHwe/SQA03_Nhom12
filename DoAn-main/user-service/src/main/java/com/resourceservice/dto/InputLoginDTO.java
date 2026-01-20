package com.resourceservice.dto;

import com.resourceservice.utilsmodule.utils.modelCustom.SearchInput;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InputLoginDTO {
    private InputGetTokenDTO bodyGetToken;
    private LocationParamsDto candidateParams;
    private SearchInput searchInput;
}
