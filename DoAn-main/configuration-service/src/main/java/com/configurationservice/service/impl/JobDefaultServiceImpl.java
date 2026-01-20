package com.configurationservice.service.impl;

import com.amazonaws.services.drs.model.Job;
import com.configurationservice.dto.input.JobDefaultInputDTO;
import com.configurationservice.dto.input.JobDefaultInputDTO_1;
import com.configurationservice.interceptor.BearerTokenWrapper;
import com.configurationservice.service.JobDefaultService;
import com.jober.utilsservice.constant.Constant;
import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.configurationservice.model.JobDefault;
import com.configurationservice.repository.JobDefaultRepo;
import com.jober.utilsservice.utils.modelCustom.SortItem;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.jober.utilsservice.constant.Constant.JOBDEFAULT;
import static com.jober.utilsservice.constant.Constant.JOBDEFAULTID;
import static com.jober.utilsservice.constant.Constant.CANDIDATE_NUM;
import static com.jober.utilsservice.constant.Constant.RECRUITER_NUM;
import static com.jober.utilsservice.constant.Constant.ROLE;
import static com.jober.utilsservice.constant.Constant.DATA;
import static com.jober.utilsservice.constant.Constant.ID;
import static com.jober.utilsservice.constant.Constant.SUCCESS_CODE;
import static com.jober.utilsservice.constant.ResponseMessageConstant.*;

@Service
public class JobDefaultServiceImpl implements JobDefaultService {
    private ResponseObject responseObject = null;    private Response response = null;
    @Autowired
    private JobDefaultRepo jobDefaultRepo;
    @PersistenceContext
    private EntityManager entityManager;
    private BearerTokenWrapper tokenWrapper;
    @Autowired
    private CommunityService communityService;
    public JobDefaultServiceImpl(BearerTokenWrapper tokenWrapper) {
        this.tokenWrapper = tokenWrapper;
    }
    @Override
    public ResponseEntity<ResponseObject> createJobDefault(JobDefault createdJobDefault) {
        ResponseObject response = null;
        HttpStatus httpStatus = null;
        JobDefault jobDefault = jobDefaultRepo.getJobDefault(createdJobDefault.getName());
        if (jobDefault != null) {
            response = new ResponseObject(EXISTED, Constant.FAILED, EXISTED);
            httpStatus = HttpStatus.NOT_IMPLEMENTED;
        } else {
            createdJobDefault.setCreationDate(LocalDateTime.now());
            createdJobDefault.setUpdateDate(LocalDateTime.now());
            JobDefault savedJobDefault = (JobDefault) jobDefaultRepo.save(createdJobDefault);
            if (savedJobDefault != null && Optional.of(savedJobDefault).isPresent()) {
                httpStatus = HttpStatus.OK;
                response = new ResponseObject(SUCCESS, Constant.SUCCESS_CODE, SUCCESS);
                response.setData(savedJobDefault);
            } else {
                response = new ResponseObject(FAILED, Constant.FAILED, FAILED);
                httpStatus = HttpStatus.NOT_IMPLEMENTED;
            }
        }
        return new ResponseEntity(response, httpStatus);
    }

    private Page<JobDefault> getPageJobDefault(JobDefaultInputDTO jobDefaultInputDTO, JobDefaultInputDTO_1 jobDefaultInputDTO_1) {
        Paging paging = jobDefaultInputDTO_1 != null? jobDefaultInputDTO_1.getPaging() : jobDefaultInputDTO.getPaging();
        int page = paging.getPage();
        int size = paging.getPage();
        int offset = (page - 1) * size;
        String sortField = null;
        String sortType = null;
        List<Long> ids = null;
        List<Long> parentIds = null;
        String keySearch = null;

        if (jobDefaultInputDTO != null) {
            sortField = jobDefaultInputDTO.getSort().getProp();
            sortType = jobDefaultInputDTO.getSort().getType();
            parentIds = jobDefaultInputDTO.getParentIds();
            keySearch = jobDefaultInputDTO.getKeySearch();
        } else {
            ids = jobDefaultInputDTO_1.getIds();
        }
        String baseQuery = "WITH RECURSIVE child_records AS (" +
                "    SELECT *" +
                "    FROM jobdefault" +
                "    WHERE parentid IN :parentIds" +
                "    UNION ALL" +
                "    SELECT t.*" +
                "    FROM jobdefault t" +
                "    INNER JOIN child_records c ON t.parentid = c.id" +
                ")" +
                "SELECT * FROM child_records WHERE id NOT IN (SELECT parentid FROM child_records)";

        String countQuery = "WITH RECURSIVE child_records AS (" +
                "    SELECT *" +
                "    FROM jobdefault" +
                "    WHERE parentid IN :parentIds" +
                "    UNION ALL" +
                "    SELECT t.*" +
                "    FROM jobdefault t" +
                "    INNER JOIN child_records c ON t.parentid = c.id" +
                ")" +
                "SELECT COUNT(*) FROM child_records WHERE id NOT IN (SELECT parentid FROM child_records)";

        if (keySearch != null && !keySearch.isEmpty()) {
            baseQuery += " AND name ILIKE :keySearch";
            countQuery += " AND name ILIKE :keySearch";
        }

        baseQuery += " ORDER BY " + sortField + " " + sortType;
        baseQuery += " LIMIT :limit OFFSET :offset";

        Query query = entityManager.createNativeQuery(baseQuery, JobDefault.class);
        Query countQueryObject = entityManager.createNativeQuery(countQuery);

        query.setParameter("parentIds", parentIds);
        countQueryObject.setParameter("parentIds", parentIds);

        if (keySearch != null && !keySearch.isEmpty()) {
            query.setParameter("keySearch", "%" + keySearch + "%");
            countQueryObject.setParameter("keySearch", "%" + keySearch + "%");
        }

        query.setParameter("limit", size);
        query.setParameter("offset", offset);

        List<JobDefault> jobDefaults = query.getResultList();
        long total = ((Number) countQueryObject.getSingleResult()).longValue();

        Pageable pageable = PageRequest.of(page - 1, size);
        return new PageImpl<>(jobDefaults, pageable, total);
    }

    /**
     * Search jobdefault by some condition like parentids, name
     * @param jobDefaultInputDTO
     * @return
     */
    @Override
    public ResponseEntity<ResponseObject> getListJobDefault(JobDefaultInputDTO jobDefaultInputDTO) {
        HttpStatus httpStatus;
        Page<JobDefault> jobDefaults = null;
        if (jobDefaultInputDTO.getParentIds() == null) {
//            Get job category
            Pageable pageable = PageRequest.of(jobDefaultInputDTO.getPaging().getPage() - 1, jobDefaultInputDTO.getPaging().getSize());
            jobDefaults = jobDefaultRepo.getListJobDefault(pageable);
        } else {
            jobDefaults = getPageJobDefault(jobDefaultInputDTO, null);
        }

        List<JobDefault> jobDefaultList = jobDefaults.getContent();
        if (jobDefaultList != null && !jobDefaultList.isEmpty()) {
            responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                    jobDefaults.getTotalElements(),
                    jobDefaultList.size(), jobDefaults.getTotalPages(), jobDefaultList);
            httpStatus = HttpStatus.OK;
        } else {
            httpStatus = HttpStatus.OK;
            responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                    0L,
                    0, new ArrayList<>());
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    public ResponseEntity<ResponseObject> getListJobChildren(JobDefaultInputDTO jobDefaultInputDTO) {
        HttpStatus httpStatus;
        Page<JobDefault> jobDefaults = null;
        String keySearch = jobDefaultInputDTO.getKeySearch();
        // get list job have parentId not null
            Pageable pageable = PageRequest.of(jobDefaultInputDTO.getPaging().getPage() - 1, jobDefaultInputDTO.getPaging().getSize());
            if(keySearch != null && !keySearch.isEmpty()) {
                keySearch = keySearch.toLowerCase();
                jobDefaults = jobDefaultRepo.getListJobChildrenByName(keySearch,pageable);
            }else{
                jobDefaults = jobDefaultRepo.getListJobChildren(pageable);
            }

        List<JobDefault> jobDefaultList = jobDefaults.getContent();
        if (jobDefaultList != null && !jobDefaultList.isEmpty()) {
            responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                    jobDefaults.getTotalElements(),
                    jobDefaultList.size(), jobDefaults.getTotalPages(), jobDefaultList);
            httpStatus = HttpStatus.OK;
        } else {
            httpStatus = HttpStatus.OK;
            responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                    0L,
                    0, new ArrayList<>());
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    @Override
    public ResponseEntity getListJobDefaultNoPost(JobDefaultInputDTO jobDefaultInputDTO) {
        HttpStatus httpStatus;
        Page<JobDefault> jobDefaults = null;
        String keySearch = jobDefaultInputDTO.getKeySearch();
        Pageable pageable = PageRequest.of(jobDefaultInputDTO.getPaging().getPage() - 1, jobDefaultInputDTO.getPaging().getSize());
        Long userid = tokenWrapper.getUid();
        Map<String, Object> map = null;
        List<Long> ids = null;
        Map<String, Object> response = communityService.getRoleByUserId(userid);
        Map<String, Object> data = (Map<String, Object>) response.get(DATA);
        int role = (int) data.get(ROLE.toLowerCase());
        if(role == RECRUITER_NUM){
            map = communityService.getListJobPosted(userid);
            List<Map<String, Object>> dataList = (List<Map<String, Object>>) map.get(DATA);
            ids = dataList.stream()
                    .map(item -> (Map<String, Object>) item.get(JOBDEFAULT))
                    .filter(jobDefault -> jobDefault != null && jobDefault.containsKey(ID))
                    .map(jobDefault -> ((Number) jobDefault.get(ID)).longValue())
                    .collect(Collectors.toList());
        }else if(role == CANDIDATE_NUM){
            map = communityService.getListFreelancerPosted(userid);
            List<Map<String, Object>> dataList = (List<Map<String, Object>>) map.get(DATA);
            ids = dataList.stream()
                    .filter(item -> item.containsKey(JOBDEFAULTID))
                    .map(item -> ((Number) item.get(JOBDEFAULTID)).longValue())
                    .collect(Collectors.toList());
        }
        if(keySearch != null && !keySearch.isEmpty()){
            keySearch = keySearch.toLowerCase();
            if(ids.size() > 0 && !ids.isEmpty()){
                jobDefaults = jobDefaultRepo.getListJobDefaultNoPost(keySearch,ids,pageable);
            }else{
                jobDefaults =  jobDefaultRepo.getListJobChildrenByName(keySearch,pageable);
            }
        }else{
            if(ids.size() > 0 && !ids.isEmpty()){
                jobDefaults = jobDefaultRepo.getListJobDefaultNoPost("",ids,pageable);
            }else{
                jobDefaults =  jobDefaultRepo.getListJobChildrenByName("",pageable);
            }
        }

        List<JobDefault> jobDefaultList = jobDefaults.getContent();
        if (jobDefaultList != null && !jobDefaultList.isEmpty()) {
            responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                    jobDefaults.getTotalElements(),
                    jobDefaultList.size(), jobDefaults.getTotalPages(), jobDefaultList);
            httpStatus = HttpStatus.OK;
        } else {
            httpStatus = HttpStatus.OK;
            responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                    0L,
                    0, new ArrayList<>());
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    /**
     * Search jobdefault by id
     * @param jobDefaultInputDTO
     * @return
     */
    @Override
    public ResponseEntity getListJobDefault(JobDefaultInputDTO_1 jobDefaultInputDTO) {
        HttpStatus httpStatus;
        List<JobDefault> jobDefaultList = null;
        Pageable pageable = PageRequest.of(jobDefaultInputDTO.getPaging().getPage() - 1, jobDefaultInputDTO.getPaging().getSize());
        Page<JobDefault> jobDefaultPage = jobDefaultRepo.getListJobDefaultByIds(jobDefaultInputDTO.getIds(), pageable);
        if (jobDefaultList != null && !jobDefaultList.isEmpty()) {
            responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                    jobDefaultPage.getTotalElements(),
                    jobDefaultList.size(), jobDefaultPage.getTotalPages(), jobDefaultList);
            httpStatus = HttpStatus.OK;
        } else {
            httpStatus = HttpStatus.OK;
            responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                    0L,
                    0, new ArrayList<>());
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    @Override
    @Transactional
    public ResponseEntity<Response> deleteByIds(List<Long> ids) {
        HttpStatus httpStatus;
        Integer deleteJobDefault = jobDefaultRepo.deleteJobDefault(ids);
        if (deleteJobDefault != 0) {
            response = new Response(DELETED, SUCCESS_CODE, DELETED);
            httpStatus = HttpStatus.OK;
        } else {
            httpStatus = HttpStatus.NOT_IMPLEMENTED;
            response = new Response(FAILED);
        }
        return new ResponseEntity(response, httpStatus);
    }
    @Override
    @Transactional
    public List<JobDefault> getListJobDefault(){
        HttpStatus httpStatus;
        List<JobDefault> lstJobDefault = jobDefaultRepo.getListJobDefault();
        if (lstJobDefault != null && !lstJobDefault.isEmpty()) {
            return lstJobDefault;
        }
        return null;
    }

    @Override
    @Transactional
    public ResponseEntity updateJobDefault(JobDefault jobDefaultParam) {
        HttpStatus httpStatus = null;
        Long id = jobDefaultParam.getId();
        Optional<JobDefault> optionalJobDefault = jobDefaultRepo.findById(id);
        boolean isChange = false;

        if (optionalJobDefault.isPresent()) {
            JobDefault jobDefault = optionalJobDefault.get();
            if (jobDefaultParam.getDes() != null && !jobDefaultParam.getDes().equals(jobDefault.getDes())) {
                jobDefault.setDes(jobDefaultParam.getDes());
                isChange = true;
            }
            if (jobDefaultParam.getName() != null && !jobDefaultParam.getName().equals(jobDefault.getName())) {
                jobDefault.setName(jobDefaultParam.getName());
                isChange = true;
            }
            if (jobDefaultParam.getParentId() != null && jobDefaultParam.getParentId() != jobDefault.getParentId()) {
                jobDefault.setParentId(jobDefaultParam.getParentId());
                isChange = true;
            }
            if (isChange) {
                jobDefault.setUpdateDate(LocalDateTime.now());
                jobDefault = (JobDefault) jobDefaultRepo.save(jobDefault);
                if (jobDefault != null) {
                    response = new Response(UPDATED, SUCCESS_CODE, UPDATED);
                    httpStatus = HttpStatus.OK;
                } else {
                    response = new Response(FAILED);
                    httpStatus = HttpStatus.NOT_MODIFIED;
                }
            } else {
                response = new Response(NOT_UPDATED);
                httpStatus = HttpStatus.NOT_MODIFIED;
            }
        }
        return new ResponseEntity(response, httpStatus);
    }
}
