package com.resourceservice.controller;
import com.resourceservice.dto.request.FileDTO;
import com.resourceservice.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("bs-user/file")
public class FileCtrl {
    @Autowired
    private S3Service s3Service;
    @PostMapping(value = "/download", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public byte[] download(@RequestBody FileDTO fileDTO) {
        return s3Service.download(fileDTO);
    }
}
