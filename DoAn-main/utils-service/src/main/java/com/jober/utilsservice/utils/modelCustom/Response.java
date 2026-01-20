package com.jober.utilsservice.utils.modelCustom;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
//@AllArgsConstructor
@NoArgsConstructor
public class Response {
    public Response(String status) {
        this.status = status;
    }
    public Response(String status, String code) {
        this.status = status;
        this.code = code;
    }
    public Response(String status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
    private String status;
    private String code;
    private String message;
}
