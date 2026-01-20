package com.resourceservice.service.impl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jober.utilsservice.constant.Constant;
import com.jober.utilsservice.model.PageableModel;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.dto.CandidateManagementDTO;
import com.resourceservice.dto.JobDTO;
import com.resourceservice.dto.UserCommonDTO;
import com.resourceservice.dto.response.CandidatesJob;
import com.resourceservice.interceptor.BearerTokenWrapper;
import com.resourceservice.model.*;
import com.resourceservice.model.projection.CandidateManagementProjection;
import com.resourceservice.repository.*;
import com.resourceservice.utilsmodule.CacheService;
import com.jober.utilsservice.constant.ConstantFields;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.resourceservice.utilsmodule.utils.modelCustom.Paging;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.resourceservice.service.CandidateManagementService;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static com.jober.utilsservice.constant.Constant.ACTIVE;
import static com.jober.utilsservice.constant.Constant.SUCCESS_CODE;
import static com.jober.utilsservice.constant.ResponseMessageConstant.*;
import static com.resourceservice.utilsmodule.constant.Constant.*;

@Service
public  class CandidateManagementImpl implements CandidateManagementService {
    @Autowired
    private CandidateManagementRepo candidateManagementRepo;
    @Autowired
    private UserCommonRepo userCommonRepo;
    @Autowired
    private JobRepo jobRepo;
    @Autowired
    private FreelancerRepo freelancerRepo;
    @Autowired
    private ScheduleRepo scheduleRepo;
    @Autowired
    private CacheService cacheService;
    @Autowired
    private CacheManager cacheManager;
    @Autowired
    private JobServiceImpl jobService;
    @Autowired
    private CommunityService communityService;
    @Autowired
    public static Logger LOGGER = LoggerFactory.getLogger(CandidateManagementImpl.class);
    private BearerTokenWrapper tokenWrapper;
    public CandidateManagementImpl(BearerTokenWrapper tokenWrapper) {
        this.tokenWrapper = tokenWrapper;
    }
    private CandidateManagement getCreatedJob(CandidateManagementDTO candidateManagementDTO) {
        CandidateManagement candidateManagement = new CandidateManagement();
        candidateManagement.setNote(candidateManagementDTO.getNote());
        candidateManagement.setStatus("1");
        candidateManagement.setJob(Job.builder().id(candidateManagementDTO.getJobId()).build());
        candidateManagement.setUserCommon(UserCommon.builder().id(candidateManagementDTO.getUserId()).build());
        candidateManagement.setCreationdate(LocalDateTime.now());
        candidateManagement.setUpdatedate(LocalDateTime.now());
        return candidateManagement;
    }
    @Override
    public ResponseEntity<Response> updateCandidateManagement(CandidateManagementDTO candidateManagementDTO) {
        HttpStatus httpStatus = HttpStatus.OK;
        Long userId = candidateManagementDTO.getUserId();
        Long jobId = candidateManagementDTO.getJobId();
        Optional<RecruiterManagement> entity = candidateManagementRepo.findByUserAndJob(userId, jobId);
        if (entity == null || Optional.of(entity).get().equals(Optional.empty()) || !Optional.of(entity).isPresent()) {
            CandidateManagement candidateManagement = getCreatedJob(candidateManagementDTO);
            candidateManagement = (CandidateManagement) candidateManagementRepo.save(candidateManagement);
            Response response = new Response();
            if (candidateManagement != null) {
                response.setCode(UPDATED);
                response.setMessage(UPDATED);
            } else {
                response.setCode(NOT_MODIFY);
                response.setMessage(NOT_MODIFIED);
            }
            return new ResponseEntity(response, httpStatus);
        }
        Response response = new Response();
        response.setCode(EXISTED);
        response.setMessage(EXISTED_DATA);
        return new ResponseEntity(response, httpStatus);
    }

    public ResponseEntity<ResponseObject> saveCandidate(CandidateManagementDTO candidateManagementDTO) {
        HttpStatus httpStatus = HttpStatus.OK;
        Long id = candidateManagementDTO.getId();
        CandidateManagement candidateManagement = null;
        if (id != null) {
            candidateManagement = (CandidateManagement) candidateManagementRepo.findById(id).get();
            candidateManagement.setActive(candidateManagementDTO.getActive());
            candidateManagement.setUpdatedate(LocalDateTime.now());
        } else {
            candidateManagementDTO.setUserId(tokenWrapper.getUid());
            candidateManagement = new CandidateManagement();
            candidateManagement.setStatus(Constant.SAVED_JOB);
            candidateManagement.setJob(Job.builder().id(candidateManagementDTO.getJobId()).build());
            candidateManagement.setUserCommon(UserCommon.builder().id(tokenWrapper.getUid()).build());
            candidateManagement.setActive(ACTIVE);
            candidateManagement.setCreationdate(LocalDateTime.now());
            candidateManagement.setUpdatedate(LocalDateTime.now());
        }
        candidateManagement = (CandidateManagement) candidateManagementRepo.save(candidateManagement);
        ResponseObject response = new ResponseObject();
        if (candidateManagement != null) {
            response.setCode(CREATED);
            response.setStatus(CREATED);
            if (candidateManagement.getActive().equals(ACTIVE)) {
                response.setData(candidateManagement);
            } else {
                response.setData(CandidateManagement.builder().active(0).build());
            }
        } else {
            httpStatus = HttpStatus.NOT_MODIFIED;
            response.setCode(NOT_MODIFY);
            response.setMessage(NOT_MODIFIED);
        }
        return new ResponseEntity(response, httpStatus);
    }

    @Override
    public ResponseEntity getJobsOfCandidate(Paging paging) {
        HttpStatus httpStatus = null;
        ResponseObject object = null;
        Pageable pageable= PageRequest.of(paging.getPage()-1, paging.getSize());
        try {
            List<Freelancer> freelancerList = freelancerRepo.findByUserId(tokenWrapper.getUid());
            List<Long> fIds = freelancerList.stream().map(item -> item.getId()).collect(Collectors.toList());
            Page<Schedule> schedulePage = scheduleRepo.findByFreelancerIdIn(fIds,pageable);
            List<Schedule> scheduleList = schedulePage.getContent();
            List<CandidatesJob> candidatesJobs = scheduleList.stream().map(item ->
                    CandidatesJob.builder()
                            .scheduleId(item.getId())
                            .jobId(item.getJob().getId())
                            .name(item.getJob().getName())
                            .jobDefaultName(item.getJob().getJobDefault().getName())
                            .ward(item.getJob().getWard())
                            .province(item.getJob().getProvince())
                            .salary(item.getJob().getSalary())
                            .status(item.getStatus())
                            .startDate(item.getStartDate())
                            .creationDate(item.getCreationDate())
                            .profit(item.getJob().getProfit())
                            .requiredExperienceLevel(item.getJob().getRequiredExperienceLevel())
                            .number(item.getJob().getNumber())
                            .workingType(item.getJob().getWorkingType())
                            .requiredSkillLevel(item.getJob().getRequiredSkillLevel())
                            .requiredSkill(item.getJob().getRequiredSkill())
                            .expDate(item.getJob().getExpDate())
                            .phone(item.getJob().getPhone())
                            .email(item.getJob().getEmail())
                            .des(item.getJob().getDes())
                            .build()
            ).collect(Collectors.toList());
            httpStatus = HttpStatus.OK;
            object = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                    (long) schedulePage.getTotalElements(),
                    schedulePage.getNumber(), schedulePage.getTotalPages(), candidatesJobs);
        } catch (Exception ex) {
            httpStatus = HttpStatus.OK;
            object = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                    0L,
                    0, new ArrayList<>());
        }
        return new ResponseEntity(object, httpStatus);
    }

    @Override
    public ResponseEntity<ResponseObject> getJobById(Long jobId) throws JsonProcessingException {
        HttpStatus httpStatus = null;
        ResponseObject object = null;
        Long userId = tokenWrapper.getUid();
        List<CandidateManagementProjection> list = null;
        LOGGER.info("getJobById userId:" + userId);
        if (userId != null) {
            list = candidateManagementRepo.findSavedJob(jobId, userId);
            LOGGER.info("getJobById findSavedJob:" + list);
        }
        Job job = null;
        JobDTO jobDTO = null;
        if(list != null && !list.isEmpty()) {
            CandidateManagementProjection candidateManagementProjection = list.get(0);
            job = candidateManagementProjection.getJob();
            jobDTO = jobService.convertToJobDTO(job);
            jobDTO.setCandidateManagementId(candidateManagementProjection.getId());
            jobDTO.setStatus(candidateManagementProjection.getStatus());
//            try {
//                LOGGER.info("getJobById jobDTO:", OBJECT_MAPPER.writeValueAsString(job));
//            } catch (JsonProcessingException e) {
//                throw new RuntimeException(e);
//            }
        } else {
            LOGGER.info("getJobById job");
            job = jobRepo.findJobById(jobId);
            LOGGER.info("getJobById job:" + job);
            if(job != null && Optional.of(job).isPresent()) {
                jobDTO = jobService.convertToJobDTO(job);
            } else {
                object = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                        0L,
                        0, null);
                httpStatus = HttpStatus.OK;
            }
        }
        if (jobDTO != null) {
            object = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                    1L,
                    1, jobDTO);
//            todo fake
            Long organizationId = job.getOrganizationId() != null? job.getOrganizationId() : 1l;
            Map<String, Object> map = communityService.getOrganization(organizationId);
            LOGGER.info("Map: {}", new ObjectMapper().writeValueAsString(map));

            jobDTO.setCompanyName(
                    map.get(ConstantFields.NAME) != null ? map.get(ConstantFields.NAME).toString() : null
            );

            jobDTO.setCompanyDes(
                    map.get("description") != null ? map.get("description").toString() : null
            );

            jobDTO.setOrganizationAvatar(
                    map.get("avatar") != null ? map.get("avatar").toString() : null
            );

            httpStatus = HttpStatus.OK;
        }
        return new ResponseEntity(object, httpStatus);
    }
    @Override
    public ResponseEntity deleteCandidateManagement(List<Long> candidateManagementIds) {
        HttpStatus httpStatus = HttpStatus.OK;
        List<Job> jobs = jobRepo.findByIds(candidateManagementIds);
        Long userId = tokenWrapper.getUid();
        List<CandidateManagement> candidateManagements = candidateManagementRepo.findCandidateByUserAndJob(userId, candidateManagementIds);
        for (CandidateManagement candidateManagement : candidateManagements) {
            candidateManagement.setActive(0);
            candidateManagement.setUpdatedate(LocalDateTime.now());
        }
        candidateManagementRepo.saveAll(candidateManagements);
        Response response = new Response();
        if(candidateManagements.size() > 0) {
            response.setStatus(UPDATED);
            response.setCode(UPDATED);
            response.setMessage(UPDATED);
        } else {
            response.setStatus(NOT_MODIFY);
            response.setCode(NOT_MODIFY);
            response.setMessage(NOT_MODIFIED);
        }
        return new ResponseEntity(response, httpStatus);
    }
}
