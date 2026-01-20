package com.jober.utilsservice.utils.modelCustom;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
public class UpdatedResponse extends Response implements Serializable {
    private Object data;
    public UpdatedResponse(String status, String code, String message, Object data) {
        super(status, code, message);
        this.data = data;
    }
}
