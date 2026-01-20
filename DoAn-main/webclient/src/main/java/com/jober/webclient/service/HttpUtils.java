package com.jober.webclient.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;

@Slf4j
public class HttpUtils {
    public static ResponseEntity postData(String body, String token, String uri) {
        ResponseEntity<String> response = null;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            if (StringUtils.hasText(token)) {
                headers.set("Authorization", "Bearer " + token);
            }
            HttpEntity<String> entity = null;
            if (StringUtils.hasText(body)) {
                entity = new HttpEntity<>(body, headers);
            }
            RestTemplate restTemplate = new RestTemplate();
            response = restTemplate.exchange(uri, HttpMethod.POST, entity, String.class);
        } catch (Exception e) {
            log.info("Error in post data ", e);
        }
        return response;
    }

    public static ResponseEntity getData(Map<String, Object> uriVariables, String token, String uri) {
        ResponseEntity<String> response = null;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            if (StringUtils.hasText(token)) {
                headers.set("Authorization", "Bearer " + token);
            }
            HttpEntity entity = new HttpEntity(headers);

            RestTemplate restTemplate = new RestTemplate();
            if (uriVariables == null || uriVariables.isEmpty()) {
                response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
            } else {
                response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class, uriVariables);
            }
        } catch (Exception e) {
            log.info("Error in post data ", e);
        }
        return response;
    }
}
