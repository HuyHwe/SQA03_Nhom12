package com.jober.utilsservice.utils.modelCustom;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseObject extends Response implements Serializable {
    public ResponseObject() {
    }
    public ResponseObject(String status, String code, String message) {
        super(status, code, message);
    }
    public ResponseObject(String status, String code, Object data) {
        super(status, code);
        this.data = data;
    }
    public ResponseObject(String status, String code, String message, Long totalCount, Integer currentCount, Integer totalPage, Object data) {
        super(status, code, message);
        this.totalCount = totalCount;
        this.currentCount = currentCount;
        this.data = data;
        this.totalPage = totalPage;
    }
    public ResponseObject(String status, String code, String message, Long totalCount, Integer currentCount, Object data) {
        super(status, code, message);
        this.totalCount = totalCount;
        this.currentCount = currentCount;
        this.data = data;
    }

    private Long totalCount;
    private Integer currentCount;
    private Integer totalPage;
    private Object data;


}
