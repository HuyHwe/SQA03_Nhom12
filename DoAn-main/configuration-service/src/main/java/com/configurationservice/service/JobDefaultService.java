package com.configurationservice.service;

import com.configurationservice.dto.input.JobDefaultInputDTO;
import com.configurationservice.dto.input.JobDefaultInputDTO_1;
import com.configurationservice.model.JobDefault;
import com.jober.utilsservice.model.PageableModel;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface JobDefaultService {

    ResponseEntity createJobDefault(JobDefault jobDefault);
    ResponseEntity getListJobDefault(JobDefaultInputDTO jobDefaultInputDTO);
    ResponseEntity getListJobDefault(JobDefaultInputDTO_1 jobDefaultInputDTO);
    ResponseEntity deleteByIds(List<Long> ids);
    ResponseEntity updateJobDefault(JobDefault jobDefault);
    ResponseEntity getListJobChildren(JobDefaultInputDTO jobDefaultInputDTO);
    List<JobDefault> getListJobDefault();
    ResponseEntity getListJobDefaultNoPost(JobDefaultInputDTO jobDefaultInputDTO);
}
