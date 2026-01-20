package com.resourceservice.dto;

import com.jober.utilsservice.model.PageableModel;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Setter
@Getter
public class BonusDTO implements Serializable {
    private String keyword;
    private String data;
    private PageableModel pageableModel;
}
