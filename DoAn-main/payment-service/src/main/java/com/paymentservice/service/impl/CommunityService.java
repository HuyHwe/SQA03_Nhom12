package com.paymentservice.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.jober.utilsservice.utils.HttpUtils;
import com.paymentservice.config.EnvProperties;
import com.paymentservice.interceptor.BearerTokenWrapper;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

import static com.jober.utilsservice.constant.Constant.*;
import static com.jober.utilsservice.constant.ConstantFields.PHONE;
import static com.paymentservice.utilsmodule.constant.APIConstant.BS_USER_SEARCH;

@Service
@Log4j2
public class CommunityService {
    @Autowired
    private EnvProperties envProperties;
    @Autowired
    private BearerTokenWrapper tokenWrapper;
    public Long getUserId(String phone) {
        Long id;
        String uri = envProperties.getUserServiceURI() + BS_USER_SEARCH;
        String token = tokenWrapper.getToken();
        Map<String, Object> request = new HashMap<>();
        request.put(PHONE, phone);
        ResponseEntity responseEntity = HttpUtils.postData(request, token, uri);

        try {
            Map<String, Object> result = OBJECT_MAPPER.readValue(responseEntity.getBody().toString(), Map.class);
            Map<String, Object> data = (Map<String, Object>) result.get(DATA);
            id = Long.parseLong(data.get(ID).toString());
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        if (id == null) throw new NullPointerException();
        return id;
    }
}
