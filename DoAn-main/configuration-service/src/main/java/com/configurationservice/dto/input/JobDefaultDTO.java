package com.configurationservice.dto.input;

import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.SortItem;
import lombok.Data;

import javax.persistence.Column;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class JobDefaultDTO {
    private Long id;
    private String des;
    private String name;
    private Long parentId;
    private LocalDateTime creationDate;
    private LocalDateTime updateDate;
}
