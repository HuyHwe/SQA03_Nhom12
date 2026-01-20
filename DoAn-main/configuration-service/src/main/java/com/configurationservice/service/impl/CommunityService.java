package com.configurationservice.service.impl;

import com.configurationservice.config.EnvProperties;
import com.configurationservice.interceptor.BearerTokenWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.jober.utilsservice.constant.Constant;
import com.jober.utilsservice.utils.HttpUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

import static com.jober.utilsservice.constant.APIConstant.*;
import static com.jober.utilsservice.constant.Constant.OBJECT_MAPPER;

@Service
public class CommunityService {
    @Autowired
    private EnvProperties envProperties;
    @Autowired
    private BearerTokenWrapper tokenWrapper;

    public Map<String, Object> getListJobPosted(Long userId){
        String uri = envProperties.getUserServiceURI() + BS_USER_JOBS_POSTED;
        Map<String, String> headers = new HashMap<>();
        headers.put("uid", userId.toString());
        ResponseEntity responseEntity = HttpUtils.getData(null, null, uri, headers);
        Map<String, Object> result;
        try {
            result = OBJECT_MAPPER.readValue(responseEntity.getBody().toString(), Map.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        return result;
    }

    public Map<String, Object> getListFreelancerPosted(Long userId){
        String uri = envProperties.getUserServiceURI() + BE_USER_FREELANCER_POSTED;
        Map<String, String> headers = new HashMap<>();
        headers.put("uid", userId.toString());
        ResponseEntity responseEntity = HttpUtils.getData(null, null, uri, headers);
        Map<String, Object> result;
        try {
            result = OBJECT_MAPPER.readValue(responseEntity.getBody().toString(), Map.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        return result;
    }

    public Map<String, Object> getRoleByUserId(Long userId){
        Map<String, Object> uriVariables = new HashMap<>();
        uriVariables.put(Constant.USER_ID, userId);
        String uri = envProperties.getUserServiceURI() + BS_USER_PROFILE + "?userId={userId}";
        String token = tokenWrapper.getToken();
        ResponseEntity responseEntity = HttpUtils.getData(uriVariables, token, uri, null);
        Map<String, Object> result;
        try {
            result = OBJECT_MAPPER.readValue(responseEntity.getBody().toString(), Map.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        return result;
    }
}
