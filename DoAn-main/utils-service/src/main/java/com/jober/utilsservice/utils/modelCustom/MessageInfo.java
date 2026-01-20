package com.jober.utilsservice.utils.modelCustom;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class MessageInfo implements Serializable {
    private String ApiKey;
    private String SecretKey;
    private String Phone;
    private String Content;
    private String IsUnicode;
    private String Brandname;
    private String SmsType;
}
