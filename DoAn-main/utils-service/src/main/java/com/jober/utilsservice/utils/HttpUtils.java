package com.jober.utilsservice.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;

@Slf4j
public class HttpUtils<T> {
    public static ResponseEntity postData(Object t, String token, String uri) {
        ResponseEntity<String> response = null;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            if (StringUtils.hasText(token)) {
                headers.set("Authorization", "Bearer " + token);
            }
            HttpEntity<Object> entity = new HttpEntity<>(t, headers);
            RestTemplate restTemplate = new RestTemplate();
            response = restTemplate.exchange(uri, HttpMethod.POST, entity, String.class);
        } catch (Exception e) {
            log.info("Error in post data ", e);
        }
        return response;
    }

    public static ResponseEntity getData(Map<String, Object> uriVariables, String token, String uri,  Map<String, String> additionalHeaders) {
        ResponseEntity<String> response = null;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            if (StringUtils.hasText(token)) {
                headers.set("Authorization", "Bearer " + token);
            }
            if (additionalHeaders != null) {
                additionalHeaders.forEach(headers::set);
            }
            HttpEntity entity = new HttpEntity(headers);
            RestTemplate restTemplate = new RestTemplate();
            if (uriVariables != null) {
                response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class, uriVariables);
            } else {
                response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
            }
        } catch (Exception e) {
            log.info("Error in post data ", e);
        }
        return response;
    }
}
