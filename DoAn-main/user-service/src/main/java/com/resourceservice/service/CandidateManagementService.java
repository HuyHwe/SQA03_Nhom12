package com.resourceservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.jober.utilsservice.model.PageableModel;
import com.resourceservice.dto.CandidateManagementDTO;
import com.resourceservice.utilsmodule.utils.modelCustom.Paging;
import org.springframework.http.ResponseEntity;

import java.util.List;


public interface CandidateManagementService{
    ResponseEntity updateCandidateManagement(CandidateManagementDTO candidateManagementDTO);
    ResponseEntity saveCandidate(CandidateManagementDTO candidateManagementDTO);
    ResponseEntity getJobsOfCandidate(Paging paging);
    ResponseEntity getJobById(Long jobId) throws JsonProcessingException;
    ResponseEntity deleteCandidateManagement(List<Long> candidateManagementIds);
}
