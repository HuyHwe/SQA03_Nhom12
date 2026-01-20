package com.jober.utilsservice.utils.modelCustom;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
public class Paging implements Serializable {
    private int page;
    private int size;
}
