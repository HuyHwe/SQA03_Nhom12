package com.resourceservice.service;

import com.resourceservice.dto.request.FileDTO;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

import java.io.File;
import java.io.IOException;

public interface S3Service {

    void uploadFile(Long userId, File file);

    byte[] getFile(Long userId) throws IOException;

    void deleteFile(String fileName);
    byte[] download(FileDTO fileDTO);
}
