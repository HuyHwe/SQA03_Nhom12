package com.paymentservice.utilsmodule.utils.modelCustom;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ResponseObject {
    private String status;
    private String code;
    private String message;
    private Long totalCount;
    private Integer currentCount;
    private Object data;
}
