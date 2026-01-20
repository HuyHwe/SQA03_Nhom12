package com.configurationservice.service;

import com.configurationservice.dto.input.PackageDTO;
import com.configurationservice.model.Package;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
public interface PackageService {
    ResponseEntity getPackages();
    ResponseEntity delete(List<Long> ids);
    ResponseEntity update(PackageDTO updatedPackage);
}
