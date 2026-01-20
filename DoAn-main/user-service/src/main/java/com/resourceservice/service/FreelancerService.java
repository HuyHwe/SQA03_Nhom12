package com.resourceservice.service;

import com.jober.utilsservice.model.PageableModel;
import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.dto.CandidateDto;
import com.resourceservice.dto.FreelancerDTO;
import com.resourceservice.dto.LocationParamsDto;
import com.resourceservice.dto.request.CandidateInputDTO;
import com.resourceservice.dto.request.FreelancerCreateDTO;
import com.resourceservice.dto.request.FreelancerCreateFullDTO;
import com.resourceservice.dto.request.JobParamDTO;
import com.resourceservice.dto.response.OrganizationDetailResponse;
import com.resourceservice.model.Freelancer;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.io.Writer;
import java.util.List;
import java.util.Map;

public interface FreelancerService {
    ResponseEntity getListFreelancer(JobParamDTO jobParamDTO);

    ResponseEntity getListFreelancerByUid(Paging paging);

    ResponseEntity createFreelancer(FreelancerCreateDTO freelancerDTO);

    ResponseEntity createFreelancerV2(FreelancerCreateFullDTO freelancerDTO);

    ResponseEntity getFreelancerByUserIdAndJobDefaultId(Long jobDefaultId);

    ResponseEntity listCandidate(LocationParamsDto params);

    ResponseEntity listFreelancersByNote(String typeNote, LocationParamsDto params);

    Freelancer newFindJob(FreelancerDTO params);
    Map<String, Object> recommendCandidatesForRecruiter(Long recruiterId, int page, int size);

    void candidatesToCsv(Writer writer, List<CandidateDto> candidateDtos);

    void listCandidatesCsv(Writer writer, LocationParamsDto params);

    FreelancerDTO convertToFreelancerDTO(Freelancer freelancer);

    ResponseEntity listFreelancerByUserId(PageableModel pageAbleModel);

    ResponseEntity updateFreelancer(FreelancerDTO freelancerDTO);
    ResponseEntity getCandidateInfo(Long freelancerId, Long jobId);
    ResponseEntity getCandidatePosts(Paging paging);
    ResponseEntity deleteByIds(List<Long> scheduleIds);
    ResponseEntity jobsHadPostByCandidate();
    void deleteCVsByUserIdAndCvNames(Long userId, List<String> cvNames);
    ResponseEntity<ResponseObject> getListFreelancerByUserId(Long userId, JobParamDTO jobParamDTO);

    OrganizationDetailResponse getOrganizationDetail(Long orgId, int page, int size);
}
