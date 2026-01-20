package com.jober.webclient.service;

import com.jober.webclient.model.ActivationFee;
import org.springframework.http.ResponseEntity;

public interface AdminService {
    ResponseEntity getSettings();
    ResponseEntity activeFee(ActivationFee body);
}
