package com.resourceservice.controller;

import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.model.Settings;
import com.resourceservice.service.SettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("bs-admin")
public class SettingsCtrl {

    @Autowired
    private SettingsService settingsService;
    @RequestMapping(method = RequestMethod.GET, value = "/getSettings")
    public ResponseEntity<ResponseObject> getSettings() {
        return settingsService.getSettings();
    }

    @RequestMapping(method = RequestMethod.GET, value = "/updateSettings")
    public ResponseEntity<ResponseObject> updateSettings(Settings settings) {
        return settingsService.updateSettings(settings);
    }
}
