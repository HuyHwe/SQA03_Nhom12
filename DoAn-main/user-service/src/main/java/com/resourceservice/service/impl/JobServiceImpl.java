package com.resourceservice.service.impl;

import static com.jober.utilsservice.constant.Constant.ACTIVE;
import static com.jober.utilsservice.constant.Constant.ERROR;
import static com.jober.utilsservice.constant.Constant.FAILED;
import static com.jober.utilsservice.constant.Constant.INACTIVE;
import static com.jober.utilsservice.constant.Constant.NULL_CODE;
import static com.jober.utilsservice.constant.Constant.SUCCESS_CODE;
import static com.jober.utilsservice.constant.ConstantFields.address;
import static com.jober.utilsservice.constant.ConstantFields.job;
import static com.jober.utilsservice.constant.ResponseMessageConstant.CREATED;
import static com.jober.utilsservice.constant.ResponseMessageConstant.DELETED;
import static com.jober.utilsservice.constant.ResponseMessageConstant.EXISTED;
import static com.jober.utilsservice.constant.ResponseMessageConstant.FOUND;
import static com.jober.utilsservice.constant.ResponseMessageConstant.NOT_EXISTED;
import static com.jober.utilsservice.constant.ResponseMessageConstant.NOT_FOUND;
import static com.jober.utilsservice.constant.ResponseMessageConstant.NOT_MODIFIED;
import static com.jober.utilsservice.constant.ResponseMessageConstant.SUCCESS;
import static com.jober.utilsservice.constant.ResponseMessageConstant.UPDATED;
import static com.resourceservice.utilsmodule.constant.Constant.NOT_MODIFY;
import static org.springframework.beans.MethodInvocationException.ERROR_CODE;

import com.jober.utilsservice.model.PageableModel;
import com.jober.utilsservice.utils.Utility;
import com.jober.utilsservice.utils.modelCustom.Coordinates;
import com.jober.utilsservice.utils.modelCustom.Filter;
import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.jober.utilsservice.utils.modelCustom.SearchInput;
import com.jober.utilsservice.utils.modelCustom.SortItem;
import com.resourceservice.common.CommonUtils;
import com.resourceservice.common.ObjectMapperUtil;
import com.resourceservice.config.EnvProperties;
import com.resourceservice.dto.JobDTO;
import com.resourceservice.dto.JobDataModel;
import com.resourceservice.dto.JobDetailDto;
import com.resourceservice.dto.LocationParamsDto;
import com.resourceservice.dto.ResponseApplyDto;
import com.resourceservice.dto.ResponseJdDTO;
import com.resourceservice.dto.UserCommonDTO;
import com.resourceservice.dto.request.ChartDataDTO;
import com.resourceservice.dto.request.JobParamDTO;
import com.resourceservice.dto.request.JobParamSearchDTO;
import com.resourceservice.dto.request.JobPostingData;
import com.resourceservice.dto.request.SalaryByIndustryData;
import com.resourceservice.dto.request.UserParamDTO1;
import com.resourceservice.interceptor.BearerTokenWrapper;
import com.resourceservice.model.Freelancer;
import com.resourceservice.model.Job;
import com.resourceservice.model.JobDefault;
import com.resourceservice.model.Organization;
import com.resourceservice.model.Schedule;
import com.resourceservice.model.UserCommon;
import com.resourceservice.model.projection.CandidateManagementProjection;
import com.resourceservice.repository.CandidateManagementRepo;
import com.resourceservice.repository.FreelancerRepo;
import com.resourceservice.repository.JobRepo;
import com.resourceservice.repository.OrganizationRepo;
import com.resourceservice.repository.ScheduleRepo;
import com.resourceservice.repository.UserCommonRepo;
import com.resourceservice.service.CandidateManagementService;
import com.resourceservice.service.JobService;
import com.resourceservice.utilsmodule.constant.Constant;
import com.resourceservice.utilsmodule.errors.RestExceptionHandler;
import java.io.Writer;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import javax.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Transactional
public class JobServiceImpl implements JobService {

  private static final Logger log = LoggerFactory.getLogger(JobServiceImpl.class);
  @Autowired
  public static RestExceptionHandler restExceptionHandler;
  public ResponseObject responseObject;
  public ResponseEntity responseEntity;
  @Autowired
  private JobRepo jobRepo;
  @Autowired
  private CommonUtils utils;
  @Autowired
  private UserCommonRepo userCommonRepo;
  @Autowired
  private FreelancerRepo freelancerRepo;
  @Autowired
  private ScheduleRepo scheduleRepo;
  @Autowired
  private EnvProperties envProperties;
  @Autowired
  private CacheManagerService cacheManagerService;
  @Autowired
  private CandidateManagementRepo candidateManagementRepo;
  @Autowired
  private OrganizationRepo organizationRepo;
  @Autowired
  private CandidateManagementService candidateManagementService;
  @PersistenceContext
  private EntityManager entityManager;
  private BearerTokenWrapper tokenWrapper;

  public JobServiceImpl(BearerTokenWrapper tokenWrapper) {
    this.tokenWrapper = tokenWrapper;
  }


  public Page<com.resourceservice.dto.JobDetailDto> getPageJobs(JobParamDTO jobParamDTO) {
    if (jobParamDTO == null) {
      log.error("JobParamDTO is null");
      throw new IllegalArgumentException("JobParamDTO cannot be null");
    }

    Paging paging = jobParamDTO.getPaging();
    if (paging == null) {
      log.warn("Paging is null, using default values");
      paging = new Paging(1, 10);
    }
    int page = paging.getPage();
    int size = paging.getSize();
    List<Long> ids = jobParamDTO.getIds() != null ? jobParamDTO.getIds() : Collections.emptyList();
    List<Long> parentIds =
        jobParamDTO.getParentIds() != null ? jobParamDTO.getParentIds() : Collections.emptyList();
    List<Long> jobDefaultIds =
        jobParamDTO.getJobDefaultIds() != null ? jobParamDTO.getJobDefaultIds()
            : Collections.emptyList();
    String keySearch = jobParamDTO.getKeySearch();
    SortItem sortItem = jobParamDTO.getSortItem();
    Coordinates coordinates = jobParamDTO.getCoordinates();

    StringBuilder queryStr = new StringBuilder();
    queryStr.append("SELECT new com.resourceservice.dto.JobDetailDto(")
        .append("j.id, ")
        .append("jd.id, ")
        .append("COALESCE(jd.name, ''), ")
        .append("j.name, ")
        .append("j.address, ")
        .append("j.job, ")
        .append("j.number, ")
        .append("j.salary, ");

    if (Utility.isExistCoordinates(coordinates)) {
      queryStr.append("(DEGREES(ACOS(LEAST(1.0, COS(RADIANS(j.lat)) ")
          .append("* COS(RADIANS(:latitude)) ")
          .append("* COS(RADIANS(j.lng - :longitude)) ")
          .append("+ SIN(RADIANS(j.lat)) ")
          .append("* SIN(RADIANS(:latitude))))) * 111.111), ");
    } else {
      queryStr.append("0.0, ");
    }

    queryStr.append("j.lat, ")
        .append("j.lng, ")
        .append("j.creationDate, ")
        .append("j.expDate, ")
        .append("j.province, ")
        .append("j.ward, ")
        .append("j.phone, ")
        .append("j.email, ")
        .append("j.workingType, ")
        .append("j.des, ")
        .append("j.requiredExperienceLevel, ")
        .append("j.requiredSkillLevel, ")
        .append("j.profit, ")
        .append("j.requiredSkill, ")
        .append("j.organizationId, j.userCommon.id, ")
        .append("o.name, o.avatar, o.description ) ")
        .append("FROM Job j ")
        .append("LEFT JOIN JobDefaultEntity jd ON j.jobDefault.id = jd.id ")
        .append("LEFT JOIN Organization o ON j.organizationId = o.id ")
        .append("WHERE 1 = 1 AND j.expDate >= CURRENT_DATE ");

    if (keySearch != null && !keySearch.isBlank()) {
      keySearch = "%" + keySearch.toLowerCase() + "%";
      queryStr.append("AND (LOWER(j.job) LIKE :keySearch ")
          .append("OR LOWER(j.name) LIKE :keySearch ")
          .append("OR LOWER(COALESCE(jd.name, '')) LIKE :keySearch) ");
    }

    if (!ids.isEmpty()) {
      queryStr.append("AND j.id IN :ids ");
    }

    if (!parentIds.isEmpty()) {
      queryStr.append("AND j.jobDefault.id IN :parentIds ");
    }

    if (!jobDefaultIds.isEmpty()) {
      queryStr.append("AND (j.jobDefault.id IN :jobDefaultIds OR jd.parentId IN :jobDefaultIds) ");
    }

    if (Utility.isExistCoordinates(coordinates)) {
      queryStr.append("AND (DEGREES(ACOS(LEAST(1.0, COS(RADIANS(j.lat)) ")
          .append("* COS(RADIANS(:latitude)) ")
          .append("* COS(RADIANS(j.lng - :longitude)) ")
          .append("+ SIN(RADIANS(j.lat)) ")
          .append("* SIN(RADIANS(:latitude))))) * 111.111) <= 100 ");
    }

    if (sortItem != null && sortItem.getProp() != null && sortItem.getType() != null) {
      if (sortItem.getProp().equals("distance")) {
        queryStr.append("ORDER BY (DEGREES(ACOS(LEAST(1.0, COS(RADIANS(j.lat)) ")
            .append("* COS(RADIANS(:latitude)) ")
            .append("* COS(RADIANS(j.lng - :longitude)) ")
            .append("+ SIN(RADIANS(j.lat)) ")
            .append("* SIN(RADIANS(:latitude))))) * 111.111) ")
            .append(sortItem.getType()).append(" ");
      } else {
        queryStr.append("ORDER BY j.").append(sortItem.getProp()).append(" ")
            .append(sortItem.getType()).append(" ");
      }
    }

    TypedQuery<com.resourceservice.dto.JobDetailDto> query;
    try {
      query = entityManager.createQuery(queryStr.toString(),
          com.resourceservice.dto.JobDetailDto.class);
    } catch (Exception e) {
      log.error("Failed to create HQL query: {}", queryStr, e);
      throw new RuntimeException("Invalid HQL query", e);
    }

    if (keySearch != null && !keySearch.isBlank()) {
      query.setParameter("keySearch", keySearch);
    }

    if (!ids.isEmpty()) {
      query.setParameter("ids", ids);
    }

    if (!parentIds.isEmpty()) {
      query.setParameter("parentIds", parentIds);
    }

    if (!jobDefaultIds.isEmpty()) {
      query.setParameter("jobDefaultIds", jobDefaultIds);
    }

    if (Utility.isExistCoordinates(coordinates)) {
      query.setParameter("latitude", coordinates.getLat());
      query.setParameter("longitude", coordinates.getLng());
    }

    List<com.resourceservice.dto.JobDetailDto> results;
    try {
      results = query.getResultList();
    } catch (Exception e) {
      log.error("Error executing query: {}", queryStr, e);
      throw new RuntimeException("Failed to fetch jobs", e);
    }

    long totalElements = results.size();
    query.setFirstResult((page - 1) * size);
    query.setMaxResults(size);

    results = query.getResultList();
    if (results == null) {
      log.warn("No jobs found for the given parameters");
      results = Collections.emptyList();
    }

    log.info("Fetched {} jobs", results.size());
    for (com.resourceservice.dto.JobDetailDto dto : results) {
      log.info("JobDetailDto: {}", dto);
    }

    return new PageImpl<>(results, PageRequest.of(page - 1, size), totalElements);
  }

  public List<JobDetailDto> getPageJobsV2(Long freelancerId) {
    RestTemplate restTemplate = new RestTemplate();
    String url = "http://python-service:8000/recommend";

    Map<String, Object> req = new HashMap<>();
    req.put("freelancer_id", freelancerId);

    ResponseEntity<List<JobDetailDto>> resp = restTemplate.exchange(
        url,
        HttpMethod.POST,
        new HttpEntity<>(req),
        new ParameterizedTypeReference<List<JobDetailDto>>() {
        }
    );

    return resp.getBody();
  }


  public Long getCountPageJob(JobParamDTO jobParamDTO) {
    List<Long> ids = jobParamDTO.getIds();
    List<Long> parentIds = jobParamDTO.getParentIds();
    String keySearch = jobParamDTO.getKeySearch();
    List<Long> jobDefaultIds = jobParamDTO.getJobDefaultIds();
    Coordinates coordinates = jobParamDTO.getCoordinates();
    TypedQuery<Long> query = null;
    StringBuilder queryStr = new StringBuilder();
    queryStr.append(
        " SELECT COUNT(j) FROM Job j LEFT JOIN JobDefaultEntity jd ON j.jobDefault.id = jd.id WHERE 1 = 1 ");

    if (jobParamDTO.getKeySearch() != null) {
      queryStr.append(" AND j.name LIKE \'%" + keySearch + "%\'");
    }

    if (ids != null) {
      queryStr.append(" AND j.id IN :ids ");
    }

    if (parentIds != null) {
      queryStr.append(" AND jd.parentId IN :parentIds");
    }

    if (jobDefaultIds != null) {
      queryStr.append(" AND j.jobDefault.id IN :jobDefaultIds");
    }

    if (Utility.isExistCoordinates(coordinates)) {
      queryStr.append(" AND (DEGREES(ACOS(LEAST(1.0, COS(RADIANS(j.lat)) " +
          "* COS(RADIANS(:latitude)) " +
          "* COS(RADIANS(j.lng - :longitude)) " +
          "+ SIN(RADIANS(j.lat)) " +
          "* SIN(RADIANS(:latitude))))) * 111.111) <= 30");
    }

    query = entityManager.createQuery(queryStr.toString(), Long.class);
    if (ids != null) {
      query.setParameter("ids", ids);
    }

    if (parentIds != null) {
      query.setParameter("parentIds", parentIds);
    }

    if (jobDefaultIds != null) {
      query.setParameter("jobDefaultIds", jobDefaultIds);
    }

    if (Utility.isExistCoordinates(coordinates)) {
      query.setParameter("latitude", coordinates.getLat());
      query.setParameter("longitude", coordinates.getLng());
    }

    return query.getSingleResult();
  }

  @Override
  public ResponseEntity<ResponseObject> listJobsCompleted(UserParamDTO1 params) {
    HttpStatus httpStatus = null;
    ResponseObject object;
    try {
      Pageable pageable = PageRequest.of(params.getPaging().getPage() - 1,
          params.getPaging().getSize());
      Page<Job> jobs = jobRepo.findJobsCompleted(params.getUserId(), pageable);
      httpStatus = HttpStatus.OK;
      log.info(jobs.getContent().toString());
      if (jobs.getContent() != null && Optional.of(jobs.getContent()).isPresent() && !Optional.of(
          jobs.getContent()).isEmpty() && jobs.getContent().size() > 0) {
        object = new ResponseObject(SUCCESS, SUCCESS_CODE, FOUND, jobs.getTotalElements(),
            jobs.getContent().size(), jobs.getContent());
      } else {
        object = new ResponseObject(SUCCESS, SUCCESS_CODE, NOT_FOUND, 0L, 0, new ArrayList<>());
      }
    } catch (NullPointerException e) {
      object = new ResponseObject(ERROR, NULL_CODE, FAILED,
          0L,
          0, new ArrayList<>());
      log.error("listJobsCompleted -> " + e);
    }
    return new ResponseEntity(object, httpStatus);
  }

  //    todo
  @Override
  public ResponseEntity<ResponseObject> applyJob(Long userId, Long jobDefaultId) {
    HttpStatus httpStatus = null;
    try {
      Freelancer freelancer = freelancerRepo.findFreelancerByUserIdAndJobDefaultId(userId,
          jobDefaultId);
      if (freelancer != null && Optional.of(freelancer).isPresent()) {
        //            todo, apply job need to get job from Job and let it a param of Schedule
        Schedule schedule = new Schedule(null, freelancer, "1");
        scheduleRepo.save(schedule);
        httpStatus = HttpStatus.OK;
        responseObject = new ResponseObject(SUCCESS, CREATED, SUCCESS,
            0L,
            0, schedule);
      } else {
        httpStatus = HttpStatus.OK;
        Response response = new Response(SUCCESS, NOT_EXISTED, NOT_EXISTED);
        return new ResponseEntity(response, httpStatus);
      }
    } catch (NullPointerException e) {
      log.error("Error from applyJob: ", e);
    }
    return new ResponseEntity(responseObject, httpStatus);
  }

  @Override
  public ResponseEntity<ResponseObject> getListJobs(JobParamDTO jobParamDTO) {
    HttpStatus httpStatus = null;
    Page<com.resourceservice.dto.JobDetailDto> jobs = getPageJobs(jobParamDTO);

    if (jobs != null && Optional.of(jobs).isPresent() && !jobs.getContent().isEmpty()) {
      List<com.resourceservice.dto.JobDetailDto> listJob = jobs.getContent();

      responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
          jobs.getTotalElements(),
          jobs.getNumber(), jobs.getTotalPages(), listJob);
      httpStatus = HttpStatus.OK;
    } else {
      httpStatus = HttpStatus.OK;
      responseObject = new ResponseObject(SUCCESS, SUCCESS_CODE, NOT_FOUND,
          0L,
          0, new ArrayList<>());
    }
    return new ResponseEntity(responseObject, httpStatus);
  }

  @Override
  public ResponseEntity<ResponseObject> getListJobsV2(Long userId, int page, int size) {
    Page<JobDetailDto> jobs = getRecommendationsByUser(userId, page, size);

    ResponseObject responseObject;
    HttpStatus httpStatus;

    if(jobs == null) {
      return new ResponseEntity<>(new ResponseObject(
          SUCCESS,
          SUCCESS_CODE,
          NOT_FOUND,
          0L,
          0,
          0,
          new ArrayList<>()
      ), HttpStatus.OK);
    }

    if (jobs != null && !jobs.getContent().isEmpty()) {
      responseObject = new ResponseObject(
          FOUND,
          SUCCESS_CODE,
          SUCCESS,
          jobs.getTotalElements(),
          jobs.getNumber(),
          jobs.getTotalPages(),
          jobs.getContent()
      );
      httpStatus = HttpStatus.OK;
    } else {
      responseObject = new ResponseObject(
          SUCCESS,
          SUCCESS_CODE,
          NOT_FOUND,
          0L,
          0,
          0,
          new ArrayList<>()
      );
      httpStatus = HttpStatus.OK;
    }

    return new ResponseEntity<>(responseObject, httpStatus);
  }

  @Override
  public ResponseEntity<ResponseObject> getJobsByOrganization(String organizationId, String jobId,
      int page, int size) {
    HttpStatus httpStatus;
    ResponseObject responseObject;

    Pageable pageable = PageRequest.of(page - 1, size);

    try {
      Long orgId = Long.parseLong(organizationId);

      Page<Job> jobs;
      if (jobId != null && !jobId.isEmpty()) {
        try {
          Long jId = Long.parseLong(jobId);
          jobs = jobRepo.findByOrganizationIdAndIdNotAndActiveAndExpDateAfter(
              orgId, jId, 1, LocalDateTime.now(), pageable
          );
        } catch (NumberFormatException e) {
          jobs = new PageImpl<>(Collections.emptyList(), pageable, 0);
        }
      } else {
        jobs = jobRepo.findByOrganizationIdAndActiveAndExpDateAfter(
            orgId, 1, LocalDateTime.now(), pageable
        );
      }

      Organization organization = organizationRepo.findById(orgId).orElse(null);

      if (jobs != null && !jobs.isEmpty()) {
        List<JobDetailDto> jobDtos = jobs.stream().map(job -> {
          JobDefault jobDefault = job.getJobDefault();
          return new JobDetailDto(
              job.getId(),
              jobDefault != null ? jobDefault.getId() : null,
              jobDefault != null ? jobDefault.getName() : "",
              job.getName(),
              job.getAddress(),
              job.getJob(),
              job.getNumber(),
              job.getSalary(),
              0.0,
              job.getLat(),
              job.getLng(),
              job.getCreationDate(),
              job.getExpDate(),
              job.getProvince(),
              job.getWard(),
              job.getPhone(),
              job.getEmail(),
              job.getWorkingType(),
              job.getDes(),
              job.getRequiredExperienceLevel(),
              job.getRequiredSkillLevel(),
              job.getProfit(),
              job.getRequiredSkill(),
              job.getOrganizationId(),
              job.getUserCommon() != null ? job.getUserCommon().getId() : null,
              organization != null ? organization.getName() : "",
              organization != null ? organization.getAvatar() : "",
              organization != null ? organization.getDescription() : ""
          );
        }).collect(Collectors.toList());

        responseObject = new ResponseObject(
            FOUND,
            SUCCESS_CODE,
            SUCCESS,
            jobs.getTotalElements(),
            jobs.getNumber(),
            jobs.getTotalPages(),
            jobDtos
        );
        httpStatus = HttpStatus.OK;
      } else {
        responseObject = new ResponseObject(
            NOT_FOUND,
            SUCCESS_CODE,
            SUCCESS,
            0L,
            page - 1,
            0,
            Collections.emptyList()
        );
        httpStatus = HttpStatus.OK;
      }

    } catch (NumberFormatException e) {
      responseObject = new ResponseObject(
          NOT_FOUND,
          SUCCESS_CODE,
          "Invalid organizationId",
          0L,
          page - 1,
          0,
          Collections.emptyList()
      );
      httpStatus = HttpStatus.BAD_REQUEST;
    } catch (Exception e) {
      log.error("Error from getJobsByOrganization: ", e);
      responseObject = new ResponseObject(
          ERROR,
          ERROR_CODE,
          "Internal server error",
          0L,
          page - 1,
          0,
          Collections.emptyList()
      );
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    return new ResponseEntity<>(responseObject, httpStatus);
  }


  public Page<JobDetailDto> getRecommendationsByUser(Long userId, int page, int size) {
    RestTemplate restTemplate = new RestTemplate();

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);

    String url = String.format("http://localhost:8000/recommend_by_user?user_id=%d&top_k=%d",
        userId, 20);

    try {
      Map<String, Object> requestBody = new HashMap<>();
      requestBody.put("user_id", userId);
      requestBody.put("top_k", 20);
      HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
      ResponseEntity<List<JobDetailDto>> resp = restTemplate.exchange(
          url,
          HttpMethod.POST,
          entity,
          new ParameterizedTypeReference<List<JobDetailDto>>() {
          }
      );

      List<JobDetailDto> allJobs = resp.getBody();
      if (allJobs == null) {
        allJobs = new ArrayList<>();
      }

      int safePage = Math.max(page - 1, 0); // đảm bảo không âm
      int start = Math.min(safePage * size, allJobs.size());
      int end = Math.min(start + size, allJobs.size());
      List<JobDetailDto> content = allJobs.subList(start, end);

      return new PageImpl<>(content, PageRequest.of(safePage, size), allJobs.size());
    } catch (Exception ex) {
      return new PageImpl<>(new ArrayList<>(), PageRequest.of(0, size), 0);
    }


  }


  @Override
  public ResponseEntity<ResponseObject> latestJobs(LocationParamsDto params) {
    HttpStatus httpStatus = null;
    try {
      int page = params.getPaging().getPage();
      int size = params.getPaging().getSize();
      Pageable pageable = PageRequest.of(page - 1, size);
      Page<Job> jobs = jobRepo.findJobs(pageable);
      if (jobs != null && Optional.of(jobs).isPresent()) {
        List<Job> listJob = jobs.getContent();
        List<JobDTO> listJobDTO = listJob
            .stream()
            .map(this::convertToJobDTO).collect(Collectors.toList());
        httpStatus = HttpStatus.OK;
        responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
            jobs.getTotalElements(), listJob.size(),
            jobs.getTotalPages(), listJobDTO);
        responseEntity = (new ResponseEntity(listJobDTO, HttpStatus.OK));
      } else {
        httpStatus = HttpStatus.OK;
        responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
            0L,
            0, new ArrayList<>());
      }
    } catch (NullPointerException e) {
      log.error("Error from getListJobs: ", e);
    }
    return new ResponseEntity(responseObject, httpStatus);
  }

  private Page<Job> getJobs(String addressParam, String jobName, Pageable pageable) {
    Page<Job> jobs = null;
    if (addressParam != null && jobName != null) {
      jobs = jobRepo.findJobs(addressParam, jobName, pageable);
    } else if (addressParam != null && jobName == null) {
      jobs = jobRepo.findJobsByAddress(addressParam, pageable);
    } else if (addressParam == null && jobName != null) {
      jobs = jobRepo.findJobsByJobName(jobName, pageable);
    } else if (addressParam == null && jobName == null) {
      jobs = jobRepo.findJobs(pageable);
    }
    return jobs;
  }

  @Override
  public ResponseEntity getListJobs(SearchInput searchInput) {
    HttpStatus httpStatus = null;
    try {
      Paging paging = searchInput.getPaging();
      int page = paging.getPage();
      int size = paging.getSize();
      Pageable pageable = PageRequest.of(page - 1, size);
      Filter filter = searchInput.getFilter();
      Map<String, List<String>> matchingAnd =
          filter != null && filter.getMatchingAnd() != null ? filter.getMatchingAnd()
              : new HashMap<>();
      String addressParam = null;
      String jobName = null;
      if (matchingAnd.containsKey(address)) {
        addressParam = matchingAnd.get(address).get(0);
      }
      if (matchingAnd.containsKey(job)) {
        jobName = matchingAnd.get(job).get(0);
      }
      Page<Job> jobs = this.getJobs(addressParam, jobName, pageable);
      if (Optional.of(jobs).isPresent()) {
        List<Job> listJob = jobs.getContent();
        List<JobDTO> listJobDTO = listJob
            .stream()
            .map(this::convertToJobDTO).collect(Collectors.toList());
        httpStatus = HttpStatus.OK;
        responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
            jobs.getTotalElements(), listJob.size(),
            jobs.getTotalPages(), listJobDTO);
        responseEntity = (new ResponseEntity(listJobDTO, HttpStatus.OK));
      } else {
        httpStatus = HttpStatus.OK;
        responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
            0L,
            0, new ArrayList<>());
      }
    } catch (NullPointerException e) {
      log.error("Error from getListJobs: ", e);
    }
    return new ResponseEntity(responseObject, httpStatus);
  }


  @Override
  public ResponseEntity listPeopleApply(UserCommonDTO userCommonDTO) {

    ResponseObject object;
    HttpStatus httpStatus = null;

    try {
      String phone = userCommonDTO.getPhone();
      PageableModel pageableModel = userCommonDTO.getPageableModel();

      int page = pageableModel.getPage();
      int size = pageableModel.getSize();
      Pageable pageable = PageRequest.of(page - 1, size);

      Page<ResponseApplyDto> responseApplyDtos = jobRepo.listPeopleApply(phone, pageable);

      if (responseApplyDtos != null && Optional.of(responseApplyDtos).isPresent()
          && !responseApplyDtos.getContent().isEmpty()) {

        object = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
            responseApplyDtos.getTotalElements(),
            responseApplyDtos.getContent().size(),
            responseApplyDtos.getTotalPages(), responseApplyDtos.getContent());

        httpStatus = HttpStatus.OK;
      } else {
        object = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
            0L,
            0, 0, new ArrayList<>());
        httpStatus = HttpStatus.OK;
      }
    } catch (Exception e) {
      object = new ResponseObject(ERROR, NULL_CODE, FAILED,
          0L,
          0, new ArrayList<>());
      log.error("listPeopleApply: ", e);

      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }
    return new ResponseEntity(object, httpStatus);
  }

  @Override
  public ResponseEntity<ResponseObject> listJobByUser(JobDTO jobDTO) {

    ResponseObject object;
    HttpStatus httpStatus = null;

    try {
      String userPhone = jobDTO.getUserPhone();
      int page = jobDTO.getPage();
      int size = jobDTO.getSize();
      Pageable pageable = PageRequest.of(page - 1, size);

      Page<Job> jds = jobRepo.listJobByUser(userPhone, pageable);

      if (jds != null && Optional.of(jds).isPresent() && !jds.getContent().isEmpty()) {

        Page<ResponseJdDTO> listJdsDTO = jds
            .map(this::convertToJdDto);

        object = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
            listJdsDTO.getTotalElements(),
            listJdsDTO.getContent().size(), listJdsDTO);

        httpStatus = HttpStatus.OK;

      } else {
        object = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
            0L,
            0, new ArrayList<>());

        httpStatus = HttpStatus.OK;
      }
    } catch (Exception e) {
      object = new ResponseObject(ERROR, NULL_CODE, FAILED,
          0L,
          0, new ArrayList<>());
      log.error("listJobById: ", e);

      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    return new ResponseEntity(object, httpStatus);
  }

  @Override
  public ResponseEntity<ResponseObject> updateActiveJob(Long jobId) {

    HttpStatus httpStatus = null;
    try {

      Optional<Job> job = jobRepo.findById(jobId);

      if (job.isPresent()) {
        if (job.get().getActive().equals(1)) {
          job.get().setActive(0);
        } else {
          job.get().setActive(1);
        }
      }

      Job updateEntity = (Job) jobRepo.save(job.get());

      if (updateEntity != null && Optional.of(updateEntity).isPresent()) {
        responseObject = new ResponseObject(UPDATED, SUCCESS_CODE, SUCCESS,
            0L,
            0, new ArrayList<>());
        httpStatus = HttpStatus.OK;
      } else {
        httpStatus = HttpStatus.NOT_MODIFIED;
        responseObject = new ResponseObject(NOT_MODIFIED, NOT_MODIFY, FAILED,
            0L,
            0, new ArrayList<>());
      }
    } catch (NullPointerException e) {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      responseObject = new ResponseObject(ERROR, NULL_CODE, FAILED,
          0L,
          0, new ArrayList<>());
      log.error("updateActiveJob: ", e);
    }
    return new ResponseEntity(responseObject, httpStatus);
  }

  @Override
  public ResponseEntity<ResponseObject> getJobsNearBy(LocationParamsDto params) {
    HttpStatus httpStatus;
    ResponseObject object;
    Double latitude = params.getCoordinates().getLat();
    Double longitude = params.getCoordinates().getLng();
    Pageable pageable = PageRequest.of(params.getPaging().getPage() - 1,
        params.getPaging().getSize());
    Page<JobDetailDto> jobDetailDtoPage = jobRepo.listJobsNearBy(latitude, longitude, pageable);
    List<JobDetailDto> jobDetailDtos;
    if (jobDetailDtoPage != null && Optional.of(jobDetailDtoPage).isPresent()
        && jobDetailDtoPage.isEmpty()) {
      jobDetailDtos = jobDetailDtoPage.getContent();
      object = new ResponseObject(FOUND, Constant.SUCCESS_CODE, SUCCESS,
          jobDetailDtoPage.getTotalElements(),
          jobDetailDtoPage.getContent().size(), jobDetailDtos);
      httpStatus = HttpStatus.OK;
    } else {
      object = new ResponseObject(NOT_FOUND, Constant.SUCCESS_CODE, SUCCESS,
          0L,
          0, new ArrayList<>());
      httpStatus = HttpStatus.OK;
    }
    return new ResponseEntity(object, httpStatus);
  }

  @Override
  public ResponseEntity findById(Long id) {
    HttpStatus httpStatus;
    ResponseObject object;
    Job job = jobRepo.findJobById(id);
    if (job != null) {
      object = new ResponseObject(FOUND, Constant.SUCCESS_CODE, SUCCESS,
          1L,
          1, job);
      httpStatus = HttpStatus.OK;
    } else {
      object = new ResponseObject(NOT_FOUND, Constant.SUCCESS_CODE, SUCCESS,
          0L,
          0, new Object());
      httpStatus = HttpStatus.OK;
    }
    return new ResponseEntity(object, httpStatus);
  }

  @Override
  public Long findJobIdByJobDefaultIdAndUserId(Long jobDefaultId) {
    Long userId = tokenWrapper.getUid();
    return jobRepo.findJobIdByJobDefaultIdAndUserId(jobDefaultId, userId);
  }

  @Override
  public ResponseEntity<Response> deleteJobs(List<Long> ids) {
    Integer updateIdx = jobRepo.updateByIds(INACTIVE, ids);
    Response response;
    if (updateIdx > 0) {
      response = new Response(UPDATED, SUCCESS_CODE, SUCCESS);
    } else {
      response = new Response(NOT_MODIFIED, FAILED, FAILED);
    }
    return new ResponseEntity<>(response, HttpStatus.OK);
  }

  @Override
  public ResponseEntity<Response> jobsHadPostByRecruiter() {
    Response object;
    HttpStatus httpStatus = null;
    Long userId = tokenWrapper.getUid();
    List<Job> jobsPosted = jobRepo.findJobDefaultIdsHavePostByRecruiter(userId);
    if (jobsPosted != null && jobsPosted.size() > 0) {
      object = new ResponseObject(FOUND, SUCCESS_CODE, jobsPosted);
      httpStatus = httpStatus.OK;
    } else {
      object = new ResponseObject(NOT_FOUND, SUCCESS_CODE, new ArrayList<>());
      httpStatus = HttpStatus.OK;
    }
    return new ResponseEntity<>(object, httpStatus);
  }

  /**
   * job match with user, list jobs which have salary same with freelancer and job of freelancer
   * equal job of job, position
   *
   * @param params
   * @return
   */
  @Override
  public ResponseEntity<ResponseObject> listJobs(LocationParamsDto params) {

    ResponseObject object;
    HttpStatus httpStatus = null;

    try {
      int page = params.getPaging().getPage();
      int size = params.getPaging().getSize();
      Pageable pageable = PageRequest.of(page - 1, size);

      Page<Job> jobs = jobRepo.listJobs(pageable);

      if (jobs != null && Optional.of(jobs).isPresent() && !jobs.getContent().isEmpty()) {

        Page<JobDataModel> jobDataModels = jobs
            .map(entity -> {
              return convertToJobModel(params, entity);
            });

        object = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
            jobDataModels.getTotalElements(),
            jobDataModels.getContent().size(), jobDataModels.getContent());

        httpStatus = HttpStatus.OK;
      } else {
        object = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
            0L,
            0, new ArrayList<>());

        httpStatus = HttpStatus.OK;
      }
    } catch (Exception e) {
      object = new ResponseObject(ERROR, NULL_CODE, FAILED,
          0L,
          0, new ArrayList<>());
      log.error("listJobs: ", e);

      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    return new ResponseEntity(object, httpStatus);
  }

  @Override
  public ResponseEntity<ResponseObject> listSavedJobs(LocationParamsDto params) {
    Long userId = tokenWrapper.getUid();
    ResponseObject object;
    HttpStatus httpStatus = null;
    try {
      int page = params.getPaging().getPage();
      int size = params.getPaging().getSize();
      Pageable pageable = PageRequest.of(page - 1, size);
      List<CandidateManagementProjection> projectionPage = candidateManagementRepo.findSavedJobs(
          userId, pageable);
      long totalCount = candidateManagementRepo.countSavedJobs(userId);
      if (projectionPage != null && Optional.of(projectionPage).isPresent()) {
        List<JobDTO> jobDTOS = projectionPage.stream().map(item -> {
          Job job = item.getJob();
          return JobDTO.builder().
              id(job.getId()).
              name(job.getJobDefault().getName()).
              job(job.getName()).
              salary(job.getSalary()).
              province(job.getProvince()).
              ward(job.getWard()).
              address(String.format("%s %s", job.getProvince(), job.getWard())).
              workingType(job.getWorkingType()).
              expDate(job.getExpDate()).
              active(job.getActive()).
              jobDefaultId(job.getJobDefault().getId()).
              build();
        }).collect(Collectors.toList());
        long totalPage = (long) Math.ceil((double) totalCount / size);
        object = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
            totalCount,
            jobDTOS.size(),
            (int) totalPage, jobDTOS);
        httpStatus = HttpStatus.OK;
      } else {
        object = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
            0L,
            0, new ArrayList<>());

        httpStatus = HttpStatus.OK;
      }
    } catch (Exception e) {
      object = new ResponseObject(ERROR, NULL_CODE, FAILED,
          0L,
          0, new ArrayList<>());
      log.error("listJobsApply: ", e);
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }
    return new ResponseEntity(object, httpStatus);
  }

  @Override
  public ResponseEntity<ResponseObject> listJobsByNote(String note, LocationParamsDto params) {

    ResponseObject object;
    HttpStatus httpStatus = null;
    Long userId = params.getUserId();

    try {

      Pageable pageable = PageRequest.of(params.getPaging().getPage() - 1,
          params.getPaging().getSize());

      Page<Job> jobs = jobRepo.ListJobsByNote(userId, note, pageable);

      if (jobs != null && Optional.of(jobs).isPresent() && !jobs.getContent().isEmpty()) {

        Page<JobDataModel> jobDataModels = jobs.map(entity -> {
          return convertToJobModel(params, entity);
        });

        object = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
            jobDataModels.getTotalElements(),
            jobDataModels.getContent().size(), jobDataModels.getContent());

        httpStatus = HttpStatus.OK;

      } else {
        object = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
            0L,
            0, new ArrayList<>());

        httpStatus = HttpStatus.OK;
      }
    } catch (Exception e) {
      object = new ResponseObject(ERROR, NULL_CODE, FAILED,
          0L,
          0, new ArrayList<>());
      log.error("listJobsByNote: ", e);

      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }
    return new ResponseEntity(object, httpStatus);
  }

  @Override
  @Transactional
  public ResponseEntity<ResponseObject> saveJob(JobDTO jobDTO) {
    try {
      JobDefault jobDefault = JobDefault.builder().id(jobDTO.getJobDefaultId()).build();
      UserCommon userCommon = UserCommon.builder().id(tokenWrapper.getUid()).build();
      UserCommon t = (UserCommon) userCommonRepo.findById(userCommon.getId()).get();
      System.out.println(">>> jobDefaultId = " + jobDefault.getId());
      System.out.println(">>> userCommonId = " + userCommon.getId());
      Long organizationId = t.getOrganizationId();
      System.out.println(">>> organizationId = " + organizationId);
      HttpStatus httpStatus;
      ResponseObject object;
      if (jobDTO.getId() == null) {
        Long existId = jobRepo.findJobIdByJobDefaultIdAndUserId(jobDefault.getId(),
            userCommon.getId());
        if (existId != null) {
          object = new ResponseObject(EXISTED, SUCCESS_CODE, SUCCESS, 0L, 0, EXISTED);
          httpStatus = HttpStatus.OK;
          return new ResponseEntity(object, httpStatus);
        }
      }

      Job job = new Job();
      if (jobDTO.getId() == null) {
        job = builJob(job, jobDTO, jobDefault, t);
        job.setCreationDate(jobDTO.getCreationDate());
      } else {
        Optional<Job> jobOptional = jobRepo.findById(jobDTO.getId());
        if (jobOptional.isPresent()) {
          job = jobOptional.get();
          job = builJob(job, jobDTO, jobDefault, userCommon);
          if (jobDTO.getActive() != null) {
            job.setActive(jobDTO.getActive());
          }
        }
      }

      // Lưu Job
      Job saveJob = (Job) jobRepo.saveAndFlush(job);

      // Kiểm tra xem Job đã được lưu
      Optional<Job> fetchedJob = jobRepo.findById(saveJob.getId());
      if (!fetchedJob.isPresent()) {
        return new ResponseEntity<>(new ResponseObject("FAILED_TO_SAVE", "FAILED", null),
            HttpStatus.INTERNAL_SERVER_ERROR);
      }

      try {
        String url = "http://localhost:8000/encode-job";
        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> payload = new HashMap<>();
        payload.put("jobId", saveJob.getId());
        payload.put("name", saveJob.getName());
        payload.put("des", saveJob.getDes());
        payload.put("requiredExperienceLevel", saveJob.getRequiredExperienceLevel());
        payload.put("requiredSkillLevel", saveJob.getRequiredSkillLevel());
        payload.put("requiredSkill", saveJob.getRequiredSkill());
        payload.put("workingType", saveJob.getWorkingType() != null ? saveJob.getWorkingType() : 0);
        payload.put("salary",
            saveJob.getSalary() != null ? Double.parseDouble(saveJob.getSalary()) : 0.0);
        payload.put("province", saveJob.getProvince());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity,
            Map.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody().get("status")
            .equals("ok")) {
          String embedding = (String) response.getBody().get("embedding");

          // Kiểm tra embedding hợp lệ
          if (embedding == null || embedding.isEmpty()) {
            throw new RuntimeException("Invalid embedding received from Python API");
          }
          Query query = entityManager.createNativeQuery(
              "UPDATE job SET embedding = CAST(? AS vector) WHERE id = ?"
          );
          query.setParameter(1, embedding);
          query.setParameter(2, saveJob.getId());
          int updatedRows = query.executeUpdate();
        } else {
          throw new RuntimeException("Python API returned an error");
        }
      } catch (Exception e) {
        throw new RuntimeException("Failed to generate embedding: " + e.getMessage());
      }

      object = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS, 1L, 1, saveJob);
      httpStatus = HttpStatus.OK;
      return new ResponseEntity(object, httpStatus);
    } catch (Exception e) {
      e.printStackTrace();
      throw e;
    }

  }

  @Override
  @Transactional
  public ResponseEntity<ResponseObject> adminSaveJobPost(JobDTO jobDTO) {
    // Kiểm tra jobDTO và userId không null
    if (jobDTO == null) {
      return new ResponseEntity<>(
              new ResponseObject("BAD_REQUEST", "400", "JobDTO cannot be null", 0L, 0, null),
              HttpStatus.BAD_REQUEST
      );
    }
    if (jobDTO.getUserId() == null) {
      return new ResponseEntity<>(
              new ResponseObject("BAD_REQUEST", "400", "User ID is required", 0L, 0, null),
              HttpStatus.BAD_REQUEST
      );
    }

    JobDefault jobDefault = JobDefault.builder().id(jobDTO.getJobDefaultId()).build();
    UserCommon userCommon = UserCommon.builder().id(jobDTO.getUserId()).build();
    HttpStatus httpStatus;
    ResponseObject object;

    // Kiểm tra jobDefaultId hợp lệ
    if (jobDTO.getJobDefaultId() == null) {
      return new ResponseEntity<>(
              new ResponseObject("BAD_REQUEST", "400", "JobDefault ID is required", 0L, 0, null),
              HttpStatus.BAD_REQUEST
      );
    }

    // Kiểm tra công việc đã tồn tại
    if (jobDTO.getId() == null) {
      Long existId = jobRepo.findJobIdByJobDefaultIdAndUserId(jobDefault.getId(),
              userCommon.getId());
      if (existId != null) {
        object = new ResponseObject("EXISTED", "200", "Job already exists", 0L, 0, null);
        httpStatus = HttpStatus.OK;
        return new ResponseEntity<>(object, httpStatus);
      }
    }

    Job job = new Job();
    if (jobDTO.getId() == null) {
      // Tạo mới công việc
      job = adminBuildJob(job, jobDTO, jobDefault, userCommon);
      job.setCreationDate(
              jobDTO.getCreationDate() != null ? jobDTO.getCreationDate() : LocalDateTime.now());
    } else {
      // Cập nhật công việc hiện có
      Optional<Job> jobOptional = jobRepo.findById(jobDTO.getId());
      if (jobOptional.isPresent()) {
        job = jobOptional.get();
        job = adminBuildJob(job, jobDTO, jobDefault, userCommon);
        if (jobDTO.getActive() != null) {
          job.setActive(jobDTO.getActive());
        }
      } else {
        return new ResponseEntity<>(
                new ResponseObject("NOT_FOUND", "404", "Job not found", 0L, 0, null),
                HttpStatus.NOT_FOUND
        );
      }
    }

    // Lưu Job
    Job savedJob = (Job) jobRepo.saveAndFlush(job);

    // Kiểm tra xem Job đã được lưu
    Optional<Job> fetchedJob = jobRepo.findById(savedJob.getId());
    if (!fetchedJob.isPresent()) {
      return new ResponseEntity<>(
              new ResponseObject("FAILED_TO_SAVE", "500", "Failed to save job", 0L, 0, null),
              HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    try {
      String url = "http://localhost:8000/encode-job";
      RestTemplate restTemplate = new RestTemplate();

      Map<String, Object> payload = new HashMap<>();
      payload.put("jobId", savedJob.getId());
      payload.put("name", savedJob.getName());
      payload.put("des", savedJob.getDes());
      payload.put("requiredExperienceLevel", savedJob.getRequiredExperienceLevel());
      payload.put("requiredSkillLevel", savedJob.getRequiredSkillLevel());
      payload.put("requiredSkill", savedJob.getRequiredSkill());
      payload.put("workingType", savedJob.getWorkingType() != null ? savedJob.getWorkingType() : 0);
      payload.put("salary",
              savedJob.getSalary() != null ? Double.parseDouble(savedJob.getSalary()) : 0.0);
      payload.put("province", savedJob.getProvince());

      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

      ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity,
              Map.class);

      if (response.getStatusCode() == HttpStatus.OK && response.getBody().get("status")
              .equals("ok")) {
        String embedding = (String) response.getBody().get("embedding");

        // Kiểm tra embedding hợp lệ
        if (embedding == null || embedding.isEmpty()) {
          throw new RuntimeException("Invalid embedding received from Python API");
        }
        Query query = entityManager.createNativeQuery(
                "UPDATE job SET embedding = CAST(? AS vector) WHERE id = ?"
        );
        query.setParameter(1, embedding);
        query.setParameter(2, savedJob.getId());
        int updatedRows = query.executeUpdate();
      } else {
        throw new RuntimeException("Python API returned an error");
      }
    } catch (Exception e) {
      throw new RuntimeException("Failed to generate embedding: " + e.getMessage());
    }

    if (savedJob != null) {
      object = new ResponseObject("FOUND", "200", "Job saved successfully", 1L, 1, savedJob);
      httpStatus = HttpStatus.OK;
    } else {
      object = new ResponseObject("NOT_FOUND", "500", "Failed to save job", 0L, 0, null);
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    return new ResponseEntity<>(object, httpStatus);
  }

  private Job builJob(Job job, JobDTO jobDTO, JobDefault jobDefault, UserCommon userCommon) {

    Double lat = jobDTO.getLat();
    Double lg = jobDTO.getLng();
    Long organizationId = userCommon.getOrganizationId();
    System.out.println("OrganizationId: " + organizationId);
    return job.toBuilder().
        id(jobDTO.getId()).
        name(jobDTO.getName()).
        lat(lat).
        lng(lg).
        userCommon(userCommon).
        phone(jobDTO.getPhone()).
        jobDefault(jobDefault).
        address(jobDTO.getAddress()).
        province(jobDTO.getProvince()).
        ward(jobDTO.getWard()).
        profit(jobDTO.getProfit()).
        des(jobDTO.getDes()).
        expDate(jobDTO.getExpDate()).
        updateDate(LocalDateTime.now()).
        salary(jobDTO.getSalary()).
        requiredSkill(jobDTO.getRequiredSkill()).
        number(jobDTO.getNumber()).
        email(jobDTO.getEmail()).
        active(ACTIVE).
        workingType(jobDTO.getWorkingType()).
        organizationId(organizationId).
        build();
  }

  private Job adminBuildJob(Job job, JobDTO jobDTO, JobDefault jobDefault, UserCommon userCommon) {

    Double lat = jobDTO.getLat() != null ? jobDTO.getLat() : 0.0;
    Double lng = jobDTO.getLng() != null ? jobDTO.getLng() : 0.0;
    return job.toBuilder().
        id(jobDTO.getId()).
        name(jobDTO.getName()).
        lat(lat).
        lng(lng).
        userCommon(userCommon).
        phone(jobDTO.getPhone()).
        jobDefault(jobDefault).
        address(jobDTO.getAddress()).
        province(jobDTO.getProvince()).
        ward(jobDTO.getWard()).
        profit(jobDTO.getProfit()).
        des(jobDTO.getDes()).
        expDate(jobDTO.getExpDate()).
        updateDate(LocalDateTime.now()).
        salary(jobDTO.getSalary()).
        requiredSkill(jobDTO.getRequiredSkill()).
        number(jobDTO.getNumber()).
        email(jobDTO.getEmail()).
        active(ACTIVE).
        workingType(jobDTO.getWorkingType()).
        organizationId(adminGetOrganizationId(jobDTO.getCompanyName())).
        build();
  }

  private Long adminGetOrganizationId(String name) {
    if (name == null || name.isEmpty()) {
      throw new IllegalArgumentException("Company name cannot be null or empty");
    }
    Optional<Organization> organization = organizationRepo.findByName(name);
    return organization.map(Organization::getId)
        .orElseThrow(() -> new IllegalStateException("Organization not found for name: " + name));
  }

  @Override
  public void listJobsCsv(Writer writer, LocationParamsDto params) {

    List<JobDataModel> jobDataModelList = null;
    try {
      List<Job> jobs = jobRepo.findByIds(params.getIds());

      jobDataModelList = jobs.stream().map(entity -> {
        return convertToJobModel(params, entity);
      }).collect(Collectors.toList());

      jobsToCsv(writer, jobDataModelList);
    } catch (Exception e) {
      log.error(e.getMessage());
    }
  }

  @Override
  public void jobsToCsv(Writer writer, List<JobDataModel> list) {
    try (CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT)) {
      csvPrinter.printRecord("ID", "Company Name", "Address", "Distance", "Job",
          "Number", "Expire Date", "Salary", "Description", "Image", "Create Date");
      for (JobDataModel model : list) {
        csvPrinter.printRecord(model.getId(),
            model.getName(),
            model.getAddress(),
            model.getDistance(),
            model.getJob(),
            model.getNumber(),
            model.getExpdate(),
            model.getSalary(),
            model.getDes(),
            model.getImg(),
            model.getCreationdate());
      }
    } catch (Exception e) {
      log.error(e.getMessage());
    }
  }

  @Override
  @Transactional
  public ResponseEntity<ResponseObject> deleteJobByIds(List<Long> jobIds) {
    HttpStatus httpStatus = null;
    Integer isDeleted = jobRepo.deleteJobByIds(jobIds);
    if (isDeleted != null && isDeleted != 0) {
      responseObject = new ResponseObject(DELETED, SUCCESS_CODE, SUCCESS,
          0L,
          0, new ArrayList<>());
      httpStatus = HttpStatus.OK;
    } else {
      httpStatus = HttpStatus.NOT_MODIFIED;
      responseObject = new ResponseObject(NOT_MODIFIED, NOT_MODIFY, FAILED,
          0L,
          0, new ArrayList<>());
    }
    return new ResponseEntity(responseObject, httpStatus);
  }

  private JobDataModel convertToJobModel(LocationParamsDto params, Job job) {
    JobDataModel model = new JobDataModel();

    try {
      model = JobDataModel.builder()
          .id(job.getId())
          .name(job.getName())
          .address(job.getAddress())
          .distance(
              Utility.distance(params.getCoordinates().getLat(), params.getCoordinates().getLng(),
                  job.getLat(), job.getLng()))
          .job(job.getJob())
          .number(job.getNumber())
          .expdate(job.getExpDate())
          .salary(job.getSalary())
          .des(job.getDes())
          .img(job.getImg())
          .lat(job.getLat())
          .lng(job.getLng())
          .type(job.getType())
          .creationdate(job.getCreationDate())
          .build();
    } catch (NumberFormatException | NullPointerException exception) {
      log.error(exception.getMessage());
    }

    return model;
  }

  public JobDTO convertToJobDTO(Job job) {
    JobDTO jobDTO = new JobDTO();
    jobDTO.setId(job.getId());
    jobDTO.setName(job.getName());
    jobDTO.setJob(job.getJob());
    jobDTO.setLat(job.getLat());
    jobDTO.setLng(job.getLng());
    jobDTO.setPhone(job.getPhone());
    jobDTO.setEmail(job.getEmail());
    jobDTO.setExpDate(job.getExpDate());
    jobDTO.setNumber(job.getNumber());
    jobDTO.setAddress(job.getAddress());
    jobDTO.setDes(job.getDes());
    jobDTO.setCv(job.getCv());
    jobDTO.setActive(job.getActive());
    jobDTO.setLevel(job.getLevel());
    jobDTO.setImg(job.getImg());
    jobDTO.setWebsite(job.getWebsite());
    jobDTO.setType(job.getType());
    jobDTO.setSalary(job.getSalary());
    jobDTO.setCreationDate(job.getCreationDate());
    UserCommon userCommon = job.getUserCommon();
    jobDTO.setSendSmsNumber(userCommon.getSendSmsNumber());
    jobDTO.setUserPhone(userCommon.getPhone());
    jobDTO.setRequiredExperienceLevel(job.getRequiredExperienceLevel());
    jobDTO.setRequiredSkillLevel(job.getRequiredSkillLevel());
    jobDTO.setRequiredSkill(job.getRequiredSkill());
    jobDTO.setProfit(job.getProfit());
    jobDTO.setWard(job.getWard());
    jobDTO.setProvince(job.getProvince());
    jobDTO.setJobDefaultId(job.getJobDefault().getId());
    return jobDTO;
  }

  public ResponseJdDTO convertToJdDto(Job job) {

    return ObjectMapperUtil.map(job, ResponseJdDTO.class);
  }

  public ChartDataDTO getChartData() {
    ChartDataDTO chartData = new ChartDataDTO();

    // 1. Mốc thời gian
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime startOfDay = now.withHour(0).withMinute(0).withSecond(0).withNano(0);
    LocalDateTime endOfDay = now.withHour(23).withMinute(59).withSecond(59).withNano(999);

    // Mốc 24 giờ trước (tính từ thời điểm hiện tại lùi lại 24h)
    LocalDateTime twentyFourHoursAgo = now.minusHours(24);

    // Mốc đầu tuần (Thứ 2)
    LocalDateTime startOfWeek = startOfDay.minusDays(now.getDayOfWeek().getValue() - 1);
    LocalDateTime endOfWeek = endOfDay;

    // 2. Lấy dữ liệu biểu đồ bài đăng trong tuần
    List<Object[]> jobPostingsData = jobRepo.findJobPostingsByDateRange(startOfWeek, endOfWeek);
    chartData.setJobPostingsThisWeek(processJobPostingsData(jobPostingsData));

    // 3. Lấy dữ liệu biểu đồ lương trong ngày
    List<Object[]> salaryData = jobRepo.findSalaryByIndustry(startOfDay, endOfDay);
    chartData.setSalaryByIndustryToday(processSalaryData(salaryData));

    // 4. LẤY 3 THÔNG TIN THỐNG KÊ MỚI (BỔ SUNG)
    // - Việc làm 24h gần nhất
    chartData.setTotalJobs24h(jobRepo.countByCreationDateAfterAndActive(twentyFourHoursAgo, 1));

    // - Tổng việc làm đang hoạt động
    chartData.setTotalActiveJobs(jobRepo.countByActive(1));

    // - Tổng số tổ chức/công ty đang hoạt động
    chartData.setTotalCompanies(organizationRepo.countByActive(1));

    return chartData;
  }

  private List<JobPostingData> processJobPostingsData(List<Object[]> data) {
    List<JobPostingData> result = new ArrayList<>();
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
    for (Object[] row : data) {
      LocalDateTime date = (LocalDateTime) row[0];
      Long count = ((Number) row[1]).longValue();
      JobPostingData jobData = new JobPostingData();
      jobData.setDate(date.format(formatter));
      jobData.setCount(count);
      result.add(jobData);
    }
    return result;
  }

  private List<SalaryByIndustryData> processSalaryData(List<Object[]> data) {
    List<SalaryByIndustryData> result = new ArrayList<>();
    // Define salary ranges (customize as needed)
    String[] salaryRanges = {"0-3 triệu", "3-10 triệu", "10-20 triệu", "20-30 triệu",
        "Trên 30 triệu"};
    long[] rangeCounts = new long[salaryRanges.length];

    for (Object[] row : data) {
      String salary = (String) row[0];
      Long count = ((Number) row[1]).longValue();
      // Parse salary and map to range (simplified logic)
      if (salary != null) {
        if (salary.contains("-")) {
          String[] parts = salary.split("-");
          double min = Double.parseDouble(parts[0].replaceAll("[^0-9.]", ""));
          if (min < 3) {
            rangeCounts[0] += count;
          } else if (min < 10) {
            rangeCounts[1] += count;
          } else if (min < 20) {
            rangeCounts[2] += count;
          } else if (min < 30) {
            rangeCounts[3] += count;
          } else {
            rangeCounts[4] += count;
          }
        } else if (salary.contains("Trên")) {
          rangeCounts[4] += count;
        }
      }
    }

    for (int i = 0; i < salaryRanges.length; i++) {
      if (rangeCounts[i] > 0) {
        SalaryByIndustryData salaryData = new SalaryByIndustryData();
        salaryData.setSalaryRange(salaryRanges[i]);
        salaryData.setCount(rangeCounts[i]);
        result.add(salaryData);
      }
    }
    return result;
  }

  public ResponseEntity<ResponseObject> searchJobsAdvanced(JobParamSearchDTO searchDTO) {
    if (searchDTO == null) {
      log.error("JobParamSearchDTO is null");
      throw new IllegalArgumentException("JobParamSearchDTO cannot be null");
    }

    // Xử lý phân trang
    int page = searchDTO.getPage() != null && searchDTO.getPage() > 0 ? searchDTO.getPage() : 1;
    int size = searchDTO.getSize() != null && searchDTO.getSize() > 0 ? searchDTO.getSize() : 10;
    Page<JobDetailDto> jobs = getPageJobsAdvanced(searchDTO);

    ResponseObject responseObject;
    HttpStatus httpStatus;
    if (jobs != null && Optional.of(jobs).isPresent() && !jobs.getContent().isEmpty()) {
      List<JobDetailDto> listJob = jobs.getContent();
      responseObject = new ResponseObject(
          FOUND,
          SUCCESS_CODE,
          SUCCESS,
          jobs.getTotalElements(),
          jobs.getNumber(),
          jobs.getTotalPages(),
          listJob
      );
      httpStatus = HttpStatus.OK;
    } else {
      responseObject = new ResponseObject(
          SUCCESS,
          SUCCESS_CODE,
          NOT_FOUND,
          0L,
          page - 1,
          0,
          new ArrayList<>()
      );
      httpStatus = HttpStatus.OK;
    }
    return new ResponseEntity<>(responseObject, httpStatus);
  }

  private Page<JobDetailDto> getPageJobsAdvanced(JobParamSearchDTO searchDTO) {
    int page = searchDTO.getPage() != null && searchDTO.getPage() > 0 ? searchDTO.getPage() : 1;
    int size = searchDTO.getSize() != null && searchDTO.getSize() > 0 ? searchDTO.getSize() : 10;

    // Xây dựng truy vấn JPQL
    StringBuilder queryStr = new StringBuilder();
    queryStr.append("SELECT new com.resourceservice.dto.JobDetailDto(")
        .append("j.id, ")
        .append("jd.id, ")
        .append("COALESCE(jd.name, ''), ")
        .append("j.name, ")
        .append("j.address, ")
        .append("j.job, ")
        .append("j.number, ")
        .append("j.salary, ")
        .append("0.0, ") // distance, không tính khoảng cách trong trường hợp này
        .append("j.lat, ")
        .append("j.lng, ")
        .append("j.creationDate, ")
        .append("j.expDate, ")
        .append("j.province, ")
        .append("j.ward, ")
        .append("j.phone, ")
        .append("j.email, ")
        .append("j.workingType, ")
        .append("j.des, ")
        .append("j.requiredExperienceLevel, ")
        .append("j.requiredSkillLevel, ")
        .append("j.profit, ")
        .append("j.requiredSkill, ")
        .append("j.organizationId, ")
        .append("j.userCommon.id, ")
        .append("o.name, ")
        .append("o.avatar, ")
        .append("o.description) ")
        .append("FROM Job j ")
        .append("LEFT JOIN JobDefault jd ON j.jobDefault.id = jd.id ")
        .append("LEFT JOIN Organization o ON j.organizationId = o.id ")
        .append("WHERE 1 = 1 AND j.expDate >= CURRENT_DATE AND j.active = 1 ");

    // Thêm các điều kiện tìm kiếm
    if (searchDTO.getSearchKey() != null && !searchDTO.getSearchKey().isBlank()) {
      queryStr.append("AND (LOWER(j.job) LIKE :searchKey ")
          .append("OR LOWER(j.name) LIKE :searchKey ")
          .append("OR LOWER(COALESCE(jd.name, '')) LIKE :searchKey) ");
    }

    if (searchDTO.getMinSalary() != null || searchDTO.getMaxSalary() != null) {
      if (searchDTO.getMinSalary() != null && searchDTO.getMaxSalary() != null) {
        queryStr.append(
            "AND CAST(j.salary AS NUMERIC) BETWEEN CAST(:minSalary AS NUMERIC) AND CAST(:maxSalary AS NUMERIC) ");
      } else if (searchDTO.getMinSalary() != null) {
        queryStr.append("AND CAST(j.salary AS NUMERIC) >= CAST(:minSalary AS NUMERIC) ");
      } else {
        queryStr.append("AND CAST(j.salary AS NUMERIC) <= CAST(:maxSalary AS NUMERIC) ");
      }
    }

    if (searchDTO.getJobDefaultId() != null) {
      queryStr.append("AND j.jobDefault.id = :jobDefaultId ");
    }

    if (searchDTO.getWorkingType() != null) {
      queryStr.append("AND j.workingType = :workingType ");
    }

    if (searchDTO.getRequiredExperienceLevel() != null) {
      queryStr.append("AND j.requiredExperienceLevel >= :requiredExperienceLevel ");
    }

    if (searchDTO.getProvince() != null && !searchDTO.getProvince().isBlank()) {
      queryStr.append("AND j.province = :province ");
    }

    // Tạo truy vấn
    TypedQuery<JobDetailDto> query;
    try {
      query = entityManager.createQuery(queryStr.toString(), JobDetailDto.class);
    } catch (Exception e) {
      log.error("Failed to create HQL query: {}", queryStr, e);
      throw new RuntimeException("Invalid HQL query", e);
    }

    // Gán tham số
    if (searchDTO.getSearchKey() != null && !searchDTO.getSearchKey().isBlank()) {
      query.setParameter("searchKey", "%" + searchDTO.getSearchKey().toLowerCase() + "%");
    }

    if (searchDTO.getMinSalary() != null) {
      query.setParameter("minSalary", searchDTO.getMinSalary());
    }

    if (searchDTO.getMaxSalary() != null) {
      query.setParameter("maxSalary", searchDTO.getMaxSalary());
    }

    if (searchDTO.getJobDefaultId() != null) {
      query.setParameter("jobDefaultId", searchDTO.getJobDefaultId());
    }

    if (searchDTO.getWorkingType() != null) {
      query.setParameter("workingType", searchDTO.getWorkingType());
    }

    if (searchDTO.getRequiredExperienceLevel() != null) {
      query.setParameter("requiredExperienceLevel", searchDTO.getRequiredExperienceLevel());
    }

    if (searchDTO.getProvince() != null && !searchDTO.getProvince().isBlank()) {
      query.setParameter("province", searchDTO.getProvince());
    }

    // Lấy tổng số bản ghi
    List<JobDetailDto> results;
    try {
      results = query.getResultList();
    } catch (Exception e) {
      log.error("Error executing query: {}", queryStr, e);
      throw new RuntimeException("Failed to fetch jobs", e);
    }

    long totalElements = results.size();

    // Áp dụng phân trang
    query.setFirstResult((page - 1) * size);
    query.setMaxResults(size);

    try {
      results = query.getResultList();
    } catch (Exception e) {
      log.error("Error executing paginated query: {}", queryStr, e);
      throw new RuntimeException("Failed to fetch paginated jobs", e);
    }

    if (results == null) {
      log.warn("No jobs found for the given parameters");
      results = Collections.emptyList();
    }

    log.info("Fetched {} jobs", results.size());
    for (JobDetailDto dto : results) {
      log.info("JobDetailDto: {}", dto);
    }

    return new PageImpl<>(results, PageRequest.of(page - 1, size), totalElements);
  }

}
