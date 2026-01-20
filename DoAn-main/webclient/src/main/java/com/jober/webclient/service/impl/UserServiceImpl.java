package com.jober.webclient.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jober.webclient.config.EnvProperties;
import com.jober.webclient.controller.UserCtrl;
import com.jober.webclient.model.TokenContainer;
import com.jober.webclient.service.HttpUtils;
import com.jober.webclient.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpSession;

import static com.jober.webclient.common.Constant.*;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    EnvProperties envProperties;
    @Autowired
    SessionService sessionService;
    private HttpSession session;

    private ObjectMapper objectMapper = new ObjectMapper();
    public static Logger LOGGER = LoggerFactory.getLogger(UserCtrl.class);
    @Override
    public ResponseEntity login(String body) {
        ResponseEntity responseEntity = null;
        String uri = envProperties.getRestServiceURI() + "bs-user/login";
        try {
            responseEntity = HttpUtils.postData(body, null, uri);
            if (responseEntity.getStatusCode() == HttpStatus.OK) {
                String responseEntityBody = (String) responseEntity.getBody();
                TokenContainer tokenContainer = objectMapper.readValue(responseEntityBody, TokenContainer.class);
                session = sessionService.session;
                session.setAttribute(ACCESS_TOKEN, tokenContainer.getAccessToken());
                session.setAttribute(REFRESH_TOKEN, tokenContainer.getRefreshToken());
                tokenContainer.getAccessToken();
            }
        } catch (NullPointerException e) {
            LOGGER.error("login ", e);
        } catch (JsonMappingException e) {
            LOGGER.error("login ", e);
            throw new RuntimeException(e);
        } catch (JsonProcessingException e) {
            LOGGER.error("login ", e);
            throw new RuntimeException(e);
        }
        return responseEntity;
    }
    @Override
    public ResponseEntity logout() {
        String uri = envProperties.getRestServiceURI() + LOGOUT_URI;
        session = sessionService.session;
        String token = (String) session.getAttribute(ACCESS_TOKEN);
        ResponseEntity responseEntity = HttpUtils.getData(null, token, uri);
        return responseEntity;
    }

    @Override
    public ResponseEntity getListUser() {
        return null;
    }

    @Override
    public ResponseEntity createUser() {
        return null;
    }

    @Override
    public ResponseEntity deleteUsers() {
        return null;
    }

    @Override
    public ResponseEntity updateUsers() {
        return null;
    }
}
