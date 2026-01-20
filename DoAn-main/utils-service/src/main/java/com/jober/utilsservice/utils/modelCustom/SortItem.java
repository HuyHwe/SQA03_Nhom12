package com.jober.utilsservice.utils.modelCustom;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
@Getter
@Setter
@AllArgsConstructor
public class SortItem implements Serializable {
    private String prop;
    private String type;
}
