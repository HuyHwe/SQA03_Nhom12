package com.resourceservice.service;

import com.resourceservice.model.Settings;
import org.springframework.http.ResponseEntity;

public interface SettingsService {
    ResponseEntity getSettings();
    ResponseEntity updateSettings(Settings settings);
}
