package com.jober.webclient.controller;


import com.jober.webclient.service.HttpUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdminCtrl {
    @RequestMapping(method = RequestMethod.GET, value = "/getSettings")
    public ResponseEntity getSettings() {
        String url = null;
//        ResponseEntity responseEntity = HttpUtils.getData(null)
        return null;
    }
}
