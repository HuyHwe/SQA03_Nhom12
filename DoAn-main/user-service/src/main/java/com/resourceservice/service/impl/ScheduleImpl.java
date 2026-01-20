package com.resourceservice.service.impl;

import com.jober.utilsservice.constant.Constant;
import com.jober.utilsservice.constant.ConstantFields;
import com.jober.utilsservice.constant.ResponseMessageConstant;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.dto.UserCommonDTO;
import com.resourceservice.dto.request.ScheduleRqDTO;
import com.resourceservice.dto.request.ScheduleInputDTO;
import com.resourceservice.dto.request.ScheduleParamDTO;
import com.resourceservice.dto.request.StatusRequest;
import com.resourceservice.dto.response.ScheduleDTO;
import com.resourceservice.dto.response.ScheduleRpDTO;
import com.resourceservice.interceptor.BearerTokenWrapper;
import com.resourceservice.model.Freelancer;
import com.resourceservice.model.Job;
import com.resourceservice.model.Schedule;
import com.resourceservice.repository.FreelancerRepo;
import com.resourceservice.repository.JobRepo;
import com.resourceservice.repository.ScheduleRepo;
import com.resourceservice.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.jober.utilsservice.constant.Constant.*;
import static com.jober.utilsservice.constant.Constant.FAILED;
import static com.jober.utilsservice.constant.Constant.NOT_MODIFIED;
import static com.jober.utilsservice.constant.ResponseMessageConstant.*;
import static com.resourceservice.utilsmodule.constant.Constant.SUCCESS_CODE;

@Service
public class ScheduleImpl implements ScheduleService {
    @Autowired
    private ScheduleRepo scheduleRepo;
    @PersistenceContext
    private EntityManager entityManager;
    @Autowired
    private FreelancerRepo freelancerRepo;
    @Autowired
    private JobRepo jobRepo;
    @Autowired
    private CacheManagerService cacheManagerService;
    @Autowired
    private CommunityService communityService;
    @Autowired
    private ScheduleRepo ScheduleRepo;
    private BearerTokenWrapper tokenWrapper;
    public ScheduleImpl(BearerTokenWrapper tokenWrapper) {
        this.tokenWrapper = tokenWrapper;
    }

    @Override
    @Transactional
    public ResponseEntity saveSchedule(ScheduleRqDTO scheduleRqDTO) {
        ResponseObject object;
        HttpStatus httpStatus = null;
        Job job = Job.builder()
                .id(scheduleRqDTO.getJobId())
                .build();
        Freelancer freelancer = (Freelancer) freelancerRepo.findById(scheduleRqDTO.getFreelancerId()).get();

        Schedule schedule = null;
        if (scheduleRqDTO.getScheduleId() != null && !scheduleRqDTO.getScheduleId().toString().isEmpty()) {
//            update
            schedule = scheduleRepo.findById(scheduleRqDTO.getScheduleId()).get();
        } else {
            List<Schedule> schedules = scheduleRepo.findByFreelancerAndJob(freelancer.getId(), job.getId());
            if (schedules == null || schedules.isEmpty()) {
//                create
                schedule =  new Schedule();
                schedule.setCreationDate(LocalDateTime.now());
                schedule.setActive(ACTIVE);
            } else {
//                update
                schedule = schedules.get(0);
            }
        }

        schedule.setTopic(scheduleRqDTO.getTopic());
        schedule.setDes(scheduleRqDTO.getDes());
        schedule.setAddress(scheduleRqDTO.getAddress());
        schedule.setStartDate(scheduleRqDTO.getStartDate());
        schedule.setEndDate(scheduleRqDTO.getEndDate());
        schedule.setType(scheduleRqDTO.getType());
        schedule.setStatus(scheduleRqDTO.getStatus());
        schedule.setInterviewMethod(scheduleRqDTO.getInterviewMethod());
        schedule.setMeetingId(scheduleRqDTO.getMeetingId());
        schedule.setMeetUrl(scheduleRqDTO.getMeetUrl());
        schedule.setMeetPasscode(scheduleRqDTO.getPasscode());
        schedule.setFeedback(scheduleRqDTO.getFeedback());
        schedule.setJob(job);
        schedule.setFreelancer(freelancer);
        schedule.setUpdateDate(LocalDateTime.now());

        Schedule isCreated = (Schedule) scheduleRepo.save(schedule);
        if(isCreated != null) {
            httpStatus = HttpStatus.OK;
            object = new ResponseObject(CREATED, SUCCESS_CODE, schedule);
        } else {
            httpStatus = HttpStatus.NOT_MODIFIED;
            return new ResponseEntity(new Response(NOT_MODIFIED), httpStatus);
        }
        return new ResponseEntity(object, httpStatus);
    }

    @Override
    public ResponseEntity<ResponseObject> getScheduleById(Long scheduleId) {
        ResponseObject object;
        HttpStatus httpStatus = null;
        Schedule schedule = scheduleRepo.findByScheduleId(scheduleId);
        if(schedule != null) {
            Long organizationId = schedule.getJob().getOrganizationId();
            Map<String, Object> map = communityService.getOrganization(organizationId);
            ScheduleDTO scheduleDTO = new ScheduleDTO();
            scheduleDTO.setId(schedule.getId());
            scheduleDTO.setJobId(schedule.getJob().getId());
            scheduleDTO.setStatus(schedule.getStatus());
            scheduleDTO.setJobName(schedule.getJob().getName());
            scheduleDTO.setOrganizationName(map.get(ConstantFields.NAME).toString());
            scheduleDTO.setExpDate(schedule.getJob().getExpDate());
            scheduleDTO.setProvince(schedule.getJob().getProvince());
            scheduleDTO.setMeetUrl(schedule.getMeetUrl());
            scheduleDTO.setInterviewMethod(schedule.getInterviewMethod());
            scheduleDTO.setMeetId(schedule.getMeetingId());
            scheduleDTO.setPasscode(schedule.getMeetPasscode());
            scheduleDTO.setWard(schedule.getJob().getWard());
            scheduleDTO.setDefaultJobName(schedule.getJob().getJobDefault().getName());
            scheduleDTO.setStartDate(schedule.getStartDate());
            scheduleDTO.setEndDate(schedule.getEndDate());
            httpStatus = HttpStatus.OK;
            object =  new ResponseObject(FOUND, Constant.SUCCESS_CODE, SUCCESS,
                    1L,
                    1, 1, scheduleDTO);

        } else {
            httpStatus = HttpStatus.OK;
            object = new ResponseObject(NOT_FOUND, SUCCESS, null);
        }
        return new ResponseEntity(object, httpStatus);
    }

    @Override
    public ResponseEntity<ResponseObject> getScheduleByStatus(ScheduleParamDTO scheduleParamDTO) {
        ResponseObject object;
        HttpStatus httpStatus = null;
        Integer page = scheduleParamDTO.getPaging().getPage();
        Integer size = scheduleParamDTO.getPaging().getSize();
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Schedule> listSchedule = scheduleRepo.getScheduleByStatus(scheduleParamDTO.getStatus(), pageable);

        if(listSchedule != null && Optional.of(listSchedule).isPresent()) {
            httpStatus = HttpStatus.OK;
            object = new ResponseObject(SUCCESS, SUCCESS, listSchedule);
        } else {
            httpStatus = HttpStatus.OK;
            object = new ResponseObject(NOT_FOUND, SUCCESS, null);
        }
        return new ResponseEntity(object, httpStatus);
    }

    @Override
    public ResponseEntity<ResponseObject> getCalendar(ScheduleInputDTO scheduleInputDTO) {
        ResponseObject object;
        HttpStatus httpStatus = null;
        TypedQuery<ScheduleRpDTO> query = null;
        StringBuilder queryStr = new StringBuilder();
        queryStr.append(" SELECT new com.resourceservice.dto.response.ScheduleRpDTO(s.id, j.id, s.status, j.name, j.expDate, j.province, j.ward, s.startDate, s.endDate, u.name, u.id, u.organizationId) " +
                "FROM Schedule s " +
                "INNER JOIN Job j ON s.job.id = j.id " +
                "INNER JOIN Freelancer f ON s.freelancer.id = f.id " +
                "INNER JOIN UserCommon u ON f.userCommon.id = u.id " +
                "WHERE 1 = 1 ");
        UserCommonDTO userCommonDTO = cacheManagerService.getUser(tokenWrapper.getUid());
        List<Long> jobIds = null;
        List<Long> freelancerIds = null;
        if (userCommonDTO.getRole().equals(RECRUITER_NUM)) {
            jobIds = jobRepo.findIdsByUserId(userCommonDTO.getId());
        } else if (userCommonDTO.getRole().equals(CANDIDATE_NUM)) {
            freelancerIds = freelancerRepo.findIdsByUserId(userCommonDTO.getId());
        }

        List<String> statuses = scheduleInputDTO.getStatuses();
        LocalDateTime startDate = scheduleInputDTO.getStartDate();
        LocalDateTime endDate = scheduleInputDTO.getEndDate();
        if (jobIds != null && !jobIds.isEmpty()) {
            queryStr.append(" AND s.job.id IN :jobIds");
        }

        if (freelancerIds != null && !freelancerIds.isEmpty()) {
            queryStr.append(" AND s.freelancer.id IN :freelancerIds");
        }

        if (statuses != null) {
            queryStr.append(" AND s.status IN :statuses");
        }
        if (startDate != null) {
            queryStr.append(" AND s.startDate >= :startDate");
        }
        if (endDate != null) {
            queryStr.append(" AND s.endDate <= :endDate");
        }
        queryStr.append(" ORDER BY s.startDate");
        query = entityManager.createQuery(queryStr.toString(), ScheduleRpDTO.class);
        if (jobIds != null && !jobIds.isEmpty()) {
            query.setParameter("jobIds", jobIds);
        }

        if (freelancerIds != null && !freelancerIds.isEmpty()) {
            query.setParameter("freelancerIds", freelancerIds);
        }

        if (statuses != null) {
            query.setParameter("statuses", statuses);
        }

        if (startDate != null) {
            query.setParameter("startDate", startDate);
        }

        if (endDate != null) {
            query.setParameter("endDate", endDate);
        }

        List<ScheduleRpDTO> listSchedule = query.getResultList();
        if(listSchedule != null && Optional.of(listSchedule).isPresent()) {
            httpStatus = HttpStatus.OK;
            object = new ResponseObject(FOUND, Constant.SUCCESS_CODE, SUCCESS,
                    new Long(listSchedule.size()),
                    listSchedule.size(), 0, listSchedule);
        } else {
            httpStatus = HttpStatus.OK;
            object = new ResponseObject(NOT_FOUND, SUCCESS, null);
        }
        return new ResponseEntity(object, httpStatus);
    }

    @Override
    public ResponseEntity getCalendarById(Long id) {

        return null;
    }

    @Transactional
    @Override
    public ResponseEntity<Response> deleteByIds(List<Long> ids) {
        Integer updateIdx = scheduleRepo.updateByIds(INACTIVE, ids);
        Response response;
        if (updateIdx > 0) {
            response = new Response(UPDATED, Constant.SUCCESS_CODE, SUCCESS);
        } else {
            response = new Response(ResponseMessageConstant.NOT_MODIFIED, FAILED, FAILED);
        }
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    @Override
    public ResponseEntity<ResponseObject> getApplicationStatus(StatusRequest statusRequest){
        List<Schedule> lst = new ArrayList<>();
        for(String status : statusRequest.getStatus()){
            List<Schedule> schedules = ScheduleRepo.aminGetScheduleByStatus(status);
            lst.addAll(schedules);
        }
        if(lst.size() > 0){
            return new ResponseEntity<>(new ResponseObject(FOUND, SUCCESS, lst), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(new ResponseObject(NOT_FOUND, SUCCESS, lst), HttpStatus.OK);
        }

    }
}
