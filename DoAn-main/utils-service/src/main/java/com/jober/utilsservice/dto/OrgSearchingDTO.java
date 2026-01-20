package com.jober.utilsservice.dto;

import com.jober.utilsservice.model.PageableModel;
import lombok.Data;

@Data
public class OrgSearchingDTO {
    private PageableModel paging;
    private Long id;
    private String name;
}
