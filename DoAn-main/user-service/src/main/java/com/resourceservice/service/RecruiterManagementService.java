package com.resourceservice.service;

import com.resourceservice.dto.RecruiterManagementDTO;
import org.springframework.http.ResponseEntity;

public interface RecruiterManagementService {
    ResponseEntity saveRecruiterManagement(RecruiterManagementDTO recruiterManagementDTO);
}
