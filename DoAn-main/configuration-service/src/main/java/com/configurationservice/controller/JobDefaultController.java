package com.configurationservice.controller;

import com.configurationservice.dto.input.JobDefaultInputDTO;
import com.configurationservice.dto.input.JobDefaultInputDTO_1;
import com.configurationservice.service.JobDefaultService;
import com.configurationservice.model.JobDefault;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Log4j2
@Data
@RestController
@RequestMapping("bs-configuration/job_default")
@RequiredArgsConstructor
public class JobDefaultController {
    @Autowired
    private JobDefaultService jobDefaultService;
    @PostMapping("/_create")
    public ResponseEntity<Response> createJobDefault(@RequestBody JobDefault jobDefault) {
        return jobDefaultService.createJobDefault(jobDefault);
    }
    @PostMapping("/_search")
    public ResponseEntity<ResponseObject> getListJobDefault(@RequestBody JobDefaultInputDTO jobDefaultInputDTO) {
        return jobDefaultService.getListJobDefault(jobDefaultInputDTO);
    }
    @PostMapping("/_search_by_ids")
    public ResponseEntity<ResponseObject> getListJobDefault(@RequestBody JobDefaultInputDTO_1 jobDefaultInputDTO) {
        return jobDefaultService.getListJobDefault(jobDefaultInputDTO);
    }
    @PostMapping("/_search_with_children")
    public ResponseEntity<ResponseObject> getListJobChildren(@RequestBody JobDefaultInputDTO jobDefaultInputDTO) {
        return jobDefaultService.getListJobChildren(jobDefaultInputDTO);
    }
    @PostMapping("/list_remain")
    public ResponseEntity<ResponseObject> getListJobDefaultNoPost(@RequestBody JobDefaultInputDTO jobDefaultInputDTO){
        return jobDefaultService.getListJobDefaultNoPost(jobDefaultInputDTO);
    }
    @PostMapping("/_delete")
    public ResponseEntity<Response> deleteByIds(@RequestBody List<Long> ids) {
        return jobDefaultService.deleteByIds(ids);
    }

    @PostMapping("/_update")
    public ResponseEntity<Response> deleteByIds(@RequestBody JobDefault jobDefault) {
        return jobDefaultService.updateJobDefault(jobDefault);
    }
    @GetMapping("/_get_all_job_default")
    public List<JobDefault> getAllJobDefault() {
        return jobDefaultService.getListJobDefault();
    }

    @PostMapping("/upload")
    public ResponseEntity<String> handleFileUpload(@RequestParam("file") MultipartFile file) {
        String uploadDirectory = "/home/tony/data/jober_v2/file";
        if (file.isEmpty()) {
            return new ResponseEntity<>("Please select a file!", HttpStatus.BAD_REQUEST);
        }
        try {
            File destination = new File(uploadDirectory + file.getOriginalFilename());
            file.transferTo(destination);
            return new ResponseEntity<>("File uploaded successfully!", HttpStatus.OK);
        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Failed to upload file!", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
