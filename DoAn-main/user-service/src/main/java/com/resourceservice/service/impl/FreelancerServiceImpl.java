package com.resourceservice.service.impl;

import com.jober.utilsservice.constant.Constant;
import com.jober.utilsservice.constant.ResponseMessageConstant;
import com.jober.utilsservice.model.PageableModel;
import com.jober.utilsservice.utils.Utility;
import com.jober.utilsservice.utils.modelCustom.*;
import com.resourceservice.common.CommonUtils;
import com.resourceservice.config.EnvProperties;
import com.resourceservice.dto.*;
import com.resourceservice.dto.request.CandidateInputDTO;
import com.resourceservice.dto.request.FreelancerCreateDTO;
import com.resourceservice.dto.request.FreelancerCreateFullDTO;
import com.resourceservice.dto.request.JobParamDTO;
import com.resourceservice.dto.response.CandidatePostDTO;
import com.resourceservice.dto.response.OrganizationDetailResponse;
import com.resourceservice.interceptor.BearerTokenWrapper;
import com.resourceservice.model.Freelancer;
import com.resourceservice.model.Job;
import com.resourceservice.model.Organization;
import com.resourceservice.model.UserCommon;
import com.resourceservice.model.projection.CandidateInfoProjection;
import com.resourceservice.model.projection.CandidateInfoProjectionV2;
import com.resourceservice.model.projection.FreelancerProjection;
import com.resourceservice.model.projection.RatingProjection;
import com.resourceservice.repository.*;
import com.resourceservice.service.FreelancerService;
import com.resourceservice.service.UserCommonService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.lang3.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import javax.transaction.Transactional;
import java.io.IOException;
import java.io.Writer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import static com.jober.utilsservice.constant.Constant.*;
import static com.jober.utilsservice.constant.Constant.ERROR;
import static com.jober.utilsservice.constant.Constant.FAILED;
import static com.jober.utilsservice.constant.Constant.NOT_MODIFIED;
import static com.jober.utilsservice.constant.Constant.NULL_CODE;
import static com.jober.utilsservice.constant.Constant.OBJECT_MAPPER;
import static com.jober.utilsservice.constant.ConstantFields.*;
import static com.jober.utilsservice.constant.ConstantFields.job;
import static com.jober.utilsservice.constant.ResponseMessageConstant.*;
import static com.resourceservice.utilsmodule.constant.Constant.*;
import static com.resourceservice.utilsmodule.constant.Constant.SUCCESS_CODE;

@Service
@Slf4j
@Transactional
public class FreelancerServiceImpl implements FreelancerService {
    @Autowired
    private FreelancerRepo freelancerRepo;

    @Autowired
    private OrganizationRepo organizationRepo;
    @Autowired
    private CommonUtils utils;
    @Autowired
    private UserCommonService userCommonService;
    @Autowired
    private CacheManagerService cacheManagerService;
    @Autowired
    private UserCommonRepo userCommonRepo;
    public ResponseObject responseObject;
    @PersistenceContext
    private EntityManager entityManager;
    @Autowired
    private EnvProperties envProperties;
    private BearerTokenWrapper tokenWrapper;
    public static Logger LOGGER = LoggerFactory.getLogger(FreelancerServiceImpl.class);
    @Autowired
    private JobRepo jobRepo;

    public FreelancerServiceImpl(BearerTokenWrapper tokenWrapper) {
        this.tokenWrapper = tokenWrapper;
    }
    private Page<Freelancer> getFreelancers(String addressParam, String jobName, Pageable pageable) {
        Page<Freelancer> freelancers = null;
        if (addressParam != null && jobName != null) {
            freelancers = freelancerRepo.findFreelancers(addressParam, jobName, pageable);
        } else if (addressParam != null && jobName == null) {
            freelancers = freelancerRepo.findFreelancersByAddress(addressParam, pageable);
        } else if (addressParam == null && jobName != null) {
            freelancers = freelancerRepo.findFreelancersByJobName(jobName, pageable);
        } else if (addressParam == null && jobName == null) {
            freelancers = freelancerRepo.findFreelancers(pageable);
        }
        return freelancers;
    }
    @Override
    public ResponseEntity<ResponseObject> getListFreelancerByUserId(Long userId, JobParamDTO jobParamDTO) {
        HttpStatus httpStatus = null;
        try {
            Double lat = jobParamDTO.getCoordinates().getLat();
            Double lng = jobParamDTO.getCoordinates().getLng();
            List<Long> jobDefaultIdsFromDB = jobRepo.findJobDefaultIdsByUserIdAndLocation(userId,lat , lng);
            if(jobDefaultIdsFromDB.size()>0) {
                jobDefaultIdsFromDB.sort((o1, o2) -> Long.compare(o1, o2));
                jobParamDTO.setJobDefaultIds(jobDefaultIdsFromDB);
            }

            LOGGER.info("jobDefaultIdsFromDB: {}", jobDefaultIdsFromDB);
            responseObject = getCandidateDto(jobParamDTO);
            if (responseObject != null && responseObject.getData() != null) {
                List<CandidateDto> candidateDtos = (List<CandidateDto>) responseObject.getData();
                candidateDtos = candidateDtos.stream().map(item -> {
                    Long freelancerId = item.getId();
                    List<RatingProjection> results = userCommonRepo.getCountRating(freelancerId);
                    int count = 0, sum = 0;
                    for (RatingProjection ratingProjection : results) {
                        if (ratingProjection.getRating() == null) continue;
                        sum += (ratingProjection.getRating() * ratingProjection.getNumber());
                        count += ratingProjection.getNumber();
                    }

                    if (count == 0) count = 1;
                    item.setRatingAvg(sum / count);
                    return item;
                }).collect(Collectors.toList());
                responseObject.setData(candidateDtos);
                httpStatus = HttpStatus.OK;
            } else {
                httpStatus = HttpStatus.NOT_MODIFIED;
                responseObject = new ResponseObject(NOT_MODIFIED, NOT_MODIFY, FAILED,
                        0L,
                        0, new ArrayList<>());
            }
            return new ResponseEntity(responseObject, httpStatus);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }



    private ResponseObject getCandidateDto(JobParamDTO jobParamDTO) {
        Paging paging = jobParamDTO.getPaging();
        int page = paging.getPage();
        int size = paging.getSize();
        List<Long> ids = jobParamDTO.getIds();
        List<Long> jobDefaultParentIds = jobParamDTO.getParentIds();
        List<Long> jobDefaultIds = jobParamDTO.getJobDefaultIds();
        String keySearch = jobParamDTO.getKeySearch();
        SortItem sortItem = jobParamDTO.getSortItem();
        Coordinates coordinates = jobParamDTO.getCoordinates();
        TypedQuery<CandidateDto> query = null;
        StringBuilder queryStr = new StringBuilder();
        queryStr.append(" SELECT new com.resourceservice.dto.CandidateDto(" +
                " j.id, " +
                " u.name, " +
                " j.birthyear, " +
                " u.gender, " +
                " jd.name as job, " +
                " j.address, " +
                " j.des, " +
                " j.salary, " +
                " j.cv, " +
                " j.phone, " +
                " j.email, " +
                " j.lat, " +
                " j.lng, " +
//                " r.id, " +
                " u.province, " +
                " u.ward, " +
                " u.avatar, " +
                " u.dateOfBirth, " +
                " j.jobDefaultId");
        if (Utility.isExistCoordinates(coordinates)) {
            queryStr.append(", (DEGREES(ACOS(LEAST(1.0, COS(RADIANS(j.lat)) " +
                    "* COS(RADIANS(:latitude)) " +
                    "* COS(RADIANS(j.lng - :longitude)) " +
                    "+ SIN(RADIANS(j.lat)) " +
                    "* SIN(RADIANS(:latitude))))) * 111.111) AS distance");
        }
        queryStr.append(") FROM Freelancer j " +
                "INNER JOIN UserCommon u ON u.id = j.userCommon.id " +
                "LEFT JOIN RecruiterManagement r ON j.id = r.freelancerid " +
                "INNER JOIN JobDefault jd ON j.jobDefaultId = jd.id WHERE 1 = 1 ");
        if (keySearch != null) {
            keySearch = keySearch.toLowerCase();
            queryStr.append(" AND (LOWER(u.name) LIKE \'%" + keySearch + "%\' OR LOWER(jd.name) LIKE \'%" + keySearch + "%\' OR LOWER(j.name) LIKE \'%" + keySearch + "%\')");
        }

        if (ids != null) {
            queryStr.append(" AND j.id IN :ids ");
        }

        if (jobDefaultParentIds != null) {
            queryStr.append(" AND jd.parentId IN :jobDefaultParentIds");
        }

        if(jobDefaultIds != null) {
            queryStr.append(" AND (j.jobDefaultId IN :jobDefaultIds OR jd.parentId IN :jobDefaultIds)");
        }

        if (Utility.isExistCoordinates(coordinates)) {
            queryStr.append(" AND (DEGREES(ACOS(LEAST(1.0, COS(RADIANS(j.lat)) " +
                    "* COS(RADIANS(:latitude)) " +
                    "* COS(RADIANS(j.lng - :longitude)) " +
                    "+ SIN(RADIANS(j.lat)) " +
                    "* SIN(RADIANS(:latitude))))) * 111.111) <= 100");
        }
        if (sortItem!= null && sortItem.getProp() != null && sortItem.getType() != null) {
            queryStr.append(" ORDER BY j." + sortItem.getProp() + " " + sortItem.getType());
        } else {
            queryStr.append(" ORDER BY j.id");
        }
        query = entityManager.createQuery(queryStr.toString(), CandidateDto.class);
        if (ids != null) {
            query.setParameter("ids", ids);
        }
        if (jobDefaultParentIds != null) {
            query.setParameter("jobDefaultParentIds", jobDefaultParentIds);
        }
        if(jobDefaultIds != null) {
            query.setParameter("jobDefaultIds", jobDefaultIds);
        }
        if (coordinates != null && coordinates.getLat() != null && coordinates.getLng() != null) {
            query.setParameter("latitude", coordinates.getLat());
            query.setParameter("longitude", coordinates.getLng());
        }
        long totalElemetns=query.getResultList().size();
        query.setFirstResult(page == 1 ? page - 1 :  (page - 1) * size);
        query.setMaxResults(size);
        List<CandidateDto> candidateDtos = query.getResultList();
        Long totalCount = getCountListCandidateDto(jobParamDTO);
        Long totalPage = totalElemetns/new Long(size) + (totalElemetns%(new Long(size)) > 0? 1L : 0);
        if (candidateDtos != null && Optional.of(candidateDtos).isPresent() && !candidateDtos.isEmpty()){
            responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                totalElemetns,
                page-1, new Integer(totalPage.toString()), candidateDtos);
        } else {
            responseObject = new ResponseObject(SUCCESS, Constant.SUCCESS_CODE, NOT_FOUND,
                    0L,
                    0, new ArrayList<>());
        }
//        Page<CandidateDto> candidateDtos = new PageImpl<>(query.getResultList(), PageRequest.of(page, size), getCountListCandidateDto(candidateInputDTO));
        return responseObject;
    }

    private Long getCountListCandidateDto(JobParamDTO jobParamDTO) {
        List<Long> ids = jobParamDTO.getIds();
        List<Long> jobDefaultParentIds = jobParamDTO.getParentIds();
        String name = jobParamDTO.getKeySearch();
        Coordinates coordinates = jobParamDTO.getCoordinates();
        TypedQuery<Long> query = null;
        StringBuilder queryStr = new StringBuilder();
        queryStr.append(" SELECT COUNT(j) FROM Freelancer j " +
                "INNER JOIN RecruiterManagement r ON j.id = r.freelancerid " +
                "LEFT JOIN JobDefault jd ON j.jobDefaultId = jd.id WHERE 1 = 1 ");
        if (name != null) {
            queryStr.append(" AND j.name LIKE \'%" + name + "%\'");
        }

        if (ids != null) {
            queryStr.append(" AND j.id IN :ids ");
        }

        if (jobDefaultParentIds != null) {
            queryStr.append(" AND j.jobDefaultId IN :jobDefaultParentIds");
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
        if (jobDefaultParentIds != null) {
            query.setParameter("jobDefaultParentIds", jobDefaultParentIds);
        }
        if (coordinates != null && coordinates.getLat() != null && coordinates.getLng() != null) {
            query.setParameter("latitude", coordinates.getLat());
            query.setParameter("longitude", coordinates.getLng());
        }
        return query.getSingleResult();
    }

    @Override
    public ResponseEntity<ResponseObject> getListFreelancer(JobParamDTO jobParamDTO) {
        HttpStatus httpStatus = null;
        responseObject = getCandidateDto(jobParamDTO);
        if (responseObject != null && responseObject.getData() != null) {
            List<CandidateDto> candidateDtos = (List<CandidateDto>) responseObject.getData();
            candidateDtos = candidateDtos.stream().map(item -> {
                Long freelancerId = item.getId();
                List<RatingProjection> results = userCommonRepo.getCountRating(freelancerId);
                int count = 0, sum = 0;
                for (RatingProjection ratingProjection: results) {
                    if (ratingProjection.getRating() == null) continue;
                    sum += (ratingProjection.getRating() * ratingProjection.getNumber());
                    count += ratingProjection.getNumber();
                }

                if (count == 0) count = 1;
                item.setRatingAvg(sum/count);
                return item;
            }).collect(Collectors.toList());
            responseObject.setData(candidateDtos);
            httpStatus = HttpStatus.OK;
        } else {
            httpStatus = HttpStatus.NOT_MODIFIED;
            responseObject = new ResponseObject(NOT_MODIFIED, NOT_MODIFY, FAILED,
                    0L,
                    0, new ArrayList<>());
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    public Map<String, Object> recommendCandidatesForRecruiter(Long recruiterId, int page, int size) {
        String url = "http://localhost:8000" + "/recommend_candidates_for_recruiter";
        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> request = new HashMap<>();
        request.put("recruiter_id", recruiterId);
        request.put("page", page);
        request.put("size", size);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, Map.class);

        return response.getBody();
    }




    @Override
    public ResponseEntity<ResponseObject> getListFreelancerByUid(Paging paging) {
        ResponseObject object;
        HttpStatus httpStatus = null;
        UserCommonDTO userCommonDTO = cacheManagerService.getUser(tokenWrapper.getUid());
        Long userId = userCommonDTO.getId();
        Pageable pageable = PageRequest.of(paging.getPage() - 1, paging.getSize());
            Page<Freelancer> freelancers = (Page<Freelancer>) freelancerRepo.findFreelancerByIds(userId, pageable);
            if (freelancers != null && Optional.of(freelancers).isPresent()) {
                httpStatus = HttpStatus.OK;
                object = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                        freelancers.getTotalElements(),
                        freelancers.getContent().size(), freelancers.getTotalPages(), freelancers.getContent());
            } else {
                httpStatus = HttpStatus.OK;
                object = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                        0L,
                        0, new ArrayList<>());
            }
        return new ResponseEntity(object, httpStatus);
    }

    @Override
    public ResponseEntity<ResponseObject> createFreelancer(FreelancerCreateDTO freelancerDTO) {
        ResponseObject object;
        HttpStatus httpStatus = null;
        Long userId =  tokenWrapper.getUid();
        if (freelancerDTO.getUserId() != null && !freelancerDTO.getUserId().toString().isEmpty()) {
            userId = freelancerDTO.getUserId();
        }
//        Job job = jobRepo.findJobById(freelancerDTO.getJobId());
        Long jobDefaultId = freelancerDTO.getJobDefaultId();
        Freelancer isExist = freelancerRepo.findFreelancerByUserIdAndJobDefaultId(userId, jobDefaultId);

        if(isExist != null && Optional.of(isExist).isPresent()) {
            httpStatus = httpStatus.OK;
            object = new ResponseObject(EXISTED, SUCCESS_CODE, isExist);
        } else {
            UserCommon userCommon = (UserCommon) userCommonRepo.findById(userId).get();
            Double lat = freelancerDTO.getLat();
            Double lg = freelancerDTO.getLng();
            String birthyear = userCommon.getDateOfBirth() != null
                    ? userCommon.getDateOfBirth().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
                    : null;
            Freelancer freelancerBuilder = Freelancer.builder()
                    .userCommon(UserCommon.builder().id(userId).build())
                    .jobDefaultId(jobDefaultId)
                    .creationDate(LocalDateTime.now())
                    .updatedate(LocalDateTime.now())
                    .skillDes(freelancerDTO.getSkillDes())
                    .active(ACTIVE)
                    .cv(freelancerDTO.getCv())
                    .lat(lat)
                    .lng(lg)
                    .name(userCommon.getName())
                    .phone(userCommon.getPhone())
                    .email(userCommon.getEmail())
                    .address(userCommon.getAddress())
                    .province(userCommon.getProvince())
                    .ward(userCommon.getWard())
                    .gender(userCommon.getGender())
                    .jobTarget(userCommon.getJobTarget())
                    .experienceDes(userCommon.getExperience())
                    .birthyear(birthyear)
                    .build();

            Freelancer freelancer = (Freelancer) freelancerRepo.saveAndFlush(freelancerBuilder);
            LOGGER.info("Saved freelancer with ID: {}", freelancer.getId());
            if (freelancer != null && Optional.of(freelancer).isPresent()) {
                try {
                    String url = "http://localhost:8000/encode-freelancer";
                    RestTemplate restTemplate = new RestTemplate();

                    Map<String, Object> body = new HashMap<>();
                    body.put("freelancerId", freelancer.getId());
                    body.put("name", freelancer.getName());
                    body.put("job", freelancer.getJob());
                    body.put("skillDes", freelancer.getSkillDes());
                    body.put("experienceDes", freelancer.getExperienceDes());
                    body.put("jobTarget", freelancer.getJobTarget());
                    body.put("experienceLevel", freelancer.getExperienceLevel());
                    body.put("skillLevel", freelancer.getSkillLevel());

                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_JSON);
                    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

                    ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
                    LOGGER.info("Response from /encode-freelancer for freelancer {}: {}", freelancer.getId(), response.getBody());

                    if (response.getStatusCode() == HttpStatus.OK && response.getBody().get("status").equals("ok")) {
                        String embedding = (String) response.getBody().get("embedding");
                        LOGGER.info("Received embedding for freelancer {}: {}", freelancer.getId(), embedding);
                        Query query = entityManager.createNativeQuery(
                                "UPDATE freelancer SET embedding = CAST(? AS vector) WHERE id = ?"
                        );
                        query.setParameter(1, embedding);
                        query.setParameter(2, freelancer.getId());
                        int updatedRows = query.executeUpdate();

                        if (updatedRows == 0) {
                            LOGGER.error("No rows updated for freelancerId {}", freelancer.getId());
                            throw new RuntimeException("Failed to update embedding for freelancerId " + freelancer.getId());
                        } else {
                            LOGGER.info("Embedding updated successfully for freelancer {}", freelancer.getId());
                        }
                    } else {
                        LOGGER.error("Failed to create embedding for freelancer {}. Response: {}", freelancer.getId(), response.getBody());
                    }
                } catch (Exception e) {
                    LOGGER.error("Error generating embedding for freelancer {}: {}", freelancer.getId(), e.getMessage());
                    throw new RuntimeException("Failed to generate embedding: " + e.getMessage());
                }

                httpStatus = HttpStatus.OK;
                object = new ResponseObject("CREATED", "SUCCESS", freelancer);
            }else {
                httpStatus = httpStatus.OK;
                object = new ResponseObject(NOT_CREATED, FAILED, freelancer);
            }
        }
        return new ResponseEntity(object, httpStatus);
    }
    @Transactional
    public ResponseEntity<ResponseObject> createFreelancerV2(FreelancerCreateFullDTO freelancerDTO) {
        ResponseObject object;
        HttpStatus httpStatus = null;
        Long userId = freelancerDTO.getUserId() != null ? freelancerDTO.getUserId() : tokenWrapper.getUid();
        Long jobDefaultId = freelancerDTO.getJobDefaultId();

        // 1. Kiểm tra tồn tại
        Freelancer isExist = freelancerRepo.findFreelancerByUserIdAndJobDefaultId(userId, jobDefaultId);
        if (isExist != null) {
            httpStatus = HttpStatus.OK;
            object = new ResponseObject("EXISTED", "SUCCESS", isExist);
            return new ResponseEntity<>(object, httpStatus);
        }

        // 2. Tạo entity Freelancer
        // Sử dụng builder để tạo entity từ DTO
        Freelancer freelancerBuilder = Freelancer.builder()
                .userCommon(UserCommon.builder().id(userId).build())
                .jobDefaultId(jobDefaultId)
                .name(freelancerDTO.getName())
                .job(freelancerDTO.getJob())
                .birthyear(freelancerDTO.getBirthyear())
                .gender(freelancerDTO.getGender() != null ? String.valueOf(freelancerDTO.getGender()) : null)
                .des(freelancerDTO.getDes())
                .address(freelancerDTO.getAddress())
                .lat(freelancerDTO.getLat())
                .lng(freelancerDTO.getLng())
                .cv(freelancerDTO.getCv())
                .active(1)
                .workingtype(freelancerDTO.getWorkingType())
                .status(freelancerDTO.getStatus())
                .img(freelancerDTO.getImg())
                .phone(freelancerDTO.getPhone())
                .email(freelancerDTO.getEmail())
                .experienceDes(freelancerDTO.getExperienceDes())
                .skillDes(freelancerDTO.getSkillDes())
                .ratingavr(0)
                .creationDate(LocalDateTime.now())
                .updatedate(LocalDateTime.now())
                .salary(freelancerDTO.getSalary() != null ? String.valueOf(freelancerDTO.getSalary()) : null)
                .ward(freelancerDTO.getWard())
                .province(freelancerDTO.getProvince())
                .jobTarget(freelancerDTO.getJobTarget())
                .experienceLevel(freelancerDTO.getExperienceLevel())
                .skillLevel(freelancerDTO.getSkillLevel())
                .matchScore(freelancerDTO.getMathScore())
                .reasons(freelancerDTO.getReasons())
                .similarityScore(0.0f)
                .gnnScore(0.0f)
                .behaviorBoost(0.0f)
                .jobId(freelancerDTO.getJobId())
                .score(0.0f)
                .cvEmbedding(freelancerDTO.getCvEmbedding())
                .build();

        // 3. Lưu Freelancer vào DB
        // Cần dùng saveAndFlush hoặc save để đảm bảo entity có ID ngay lập tức
        Freelancer freelancer = (Freelancer) freelancerRepo.saveAndFlush(freelancerBuilder);
        LOGGER.info("Saved initial freelancer with ID: {}", freelancer.getId());

        // Biến để lưu trữ embedding nhận được
        String embeddingString = null;
        List<Float> embeddingList = null;

        if (freelancer != null && Optional.of(freelancer).isPresent()) {
            try {
                RestTemplate restTemplate = new RestTemplate();

                // --- GỌI API 1: Tạo Embedding (/encode-freelancer) ---
                String encodeUrl = "http://localhost:8000/encode-freelancer";

                // Lấy TẤT CẢ các trường cần thiết cho việc tạo embedding
                Map<String, Object> encodeBody = new HashMap<>();
                encodeBody.put("freelancerId", freelancer.getId());
                encodeBody.put("name", freelancer.getName());
                encodeBody.put("job", freelancer.getJob());
                encodeBody.put("skillDes", freelancer.getSkillDes());
                encodeBody.put("experienceDes", freelancer.getExperienceDes());
                encodeBody.put("jobTarget", freelancer.getJobTarget());
                encodeBody.put("experienceLevel", freelancer.getExperienceLevel());
                encodeBody.put("skillLevel", freelancer.getSkillLevel());
                // Các trường khác nếu cần (ví dụ: phone, email, address)
                encodeBody.put("phone", freelancer.getPhone());
                encodeBody.put("email", freelancer.getEmail());
                encodeBody.put("address", freelancer.getAddress());


                HttpHeaders encodeHeaders = new HttpHeaders();
                encodeHeaders.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> encodeEntity = new HttpEntity<>(encodeBody, encodeHeaders);

                ResponseEntity<Map> encodeResponse = restTemplate.exchange(encodeUrl, HttpMethod.POST, encodeEntity, Map.class);

                if (encodeResponse.getStatusCode() == HttpStatus.OK && encodeResponse.getBody() != null && "ok".equals(encodeResponse.getBody().get("status"))) {
                    embeddingString = (String) encodeResponse.getBody().get("embedding");

                    if (embeddingString != null && !embeddingString.isEmpty()) {
                        // Chuyển đổi chuỗi embedding thành List<Float>
                        String cleanEmbedding = embeddingString.replace("[", "").replace("]", "").trim();
                        embeddingList = Arrays.stream(cleanEmbedding.split(","))
                                .map(String::trim)
                                .map(Float::parseFloat)
                                .collect(Collectors.toList());

                        // Cập nhật embedding vào DB (QUAN TRỌNG: để dùng cho các lần truy vấn vector sau này)
                        Query updateEmbeddingQuery = entityManager.createNativeQuery(
                                "UPDATE freelancer SET embedding = CAST(? AS vector) WHERE id = ?"
                        );
                        updateEmbeddingQuery.setParameter(1, embeddingString);
                        updateEmbeddingQuery.setParameter(2, freelancer.getId());
                        updateEmbeddingQuery.executeUpdate();
                        LOGGER.info("Embedding updated successfully for freelancer {}", freelancer.getId());
                    }

                } else {
                    LOGGER.error("Failed to create embedding for freelancer {}. Response: {}", freelancer.getId(), encodeResponse.getBody());
                    throw new RuntimeException("Failed to generate embedding for freelancerId " + freelancer.getId());
                }

                if (embeddingList != null) {
                    String scoreUrl = "http://localhost:8000/calculate_candidate_score";

                    Map<String, Object> scoreBody = new HashMap<>();

                    scoreBody.put("jobId", freelancerDTO.getJobId());
                    scoreBody.put("freelancerId", freelancer.getId());
                    scoreBody.put("freelancerEmbedding", embeddingList);
                    scoreBody.put("matchScore", freelancer.getMatchScore());
                    scoreBody.put("name", freelancer.getName());
                    scoreBody.put("job", freelancer.getJob());
                    scoreBody.put("skillDes", freelancer.getSkillDes());
                    scoreBody.put("experienceDes", freelancer.getExperienceDes());
                    scoreBody.put("jobTarget", freelancer.getJobTarget());
                    scoreBody.put("experienceLevel", freelancer.getExperienceLevel());
                    scoreBody.put("skillLevel", freelancer.getSkillLevel());
                    scoreBody.put("avatar", freelancer.getImg());
                    scoreBody.put("phone", freelancer.getPhone());
                    scoreBody.put("email", freelancer.getEmail());

                    HttpHeaders scoreHeaders = new HttpHeaders();
                    scoreHeaders.setContentType(MediaType.APPLICATION_JSON);
                    HttpEntity<Map<String, Object>> scoreEntity = new HttpEntity<>(scoreBody, scoreHeaders);

                    ResponseEntity<Map> scoreResponse = restTemplate.exchange(scoreUrl, HttpMethod.POST, scoreEntity, Map.class);

                    if (scoreResponse.getStatusCode() == HttpStatus.OK && scoreResponse.getBody() != null) {
                        Map<String, Object> scoreData = scoreResponse.getBody();
                        Query updateScoreQuery = entityManager.createNativeQuery(
                                "UPDATE freelancer SET similarity_score = ?, gnn_score = ?, behavior_boost = ?, score = ? WHERE id = ?"
                        );
                        updateScoreQuery.setParameter(1, scoreData.get("similarityScore"));
                        updateScoreQuery.setParameter(2, scoreData.get("gnnScore"));
                        updateScoreQuery.setParameter(3, scoreData.get("behaviorBoost"));
                        updateScoreQuery.setParameter(4, scoreData.get("score"));
                        updateScoreQuery.setParameter(5, freelancer.getId());
                        updateScoreQuery.executeUpdate();
                        LOGGER.info("Score final {}",  scoreData.get("score"));
                        // Cập nhật lại entity để trả về
                        freelancer.setSimilarityScore(((Number) scoreData.get("similarityScore")).floatValue());
                        freelancer.setGnnScore(((Number) scoreData.get("gnnScore")).floatValue());
                        freelancer.setBehaviorBoost(((Number) scoreData.get("behaviorBoost")).floatValue());
                        freelancer.setMatchScore((freelancerDTO.getMathScore()));
                        freelancer.setScore(((Number) scoreData.get("score")).floatValue());
                        freelancer.setCvEmbedding(freelancerDTO.getCvEmbedding());

                    } else {
                        LOGGER.error("Failed to calculate score for freelancer {}. Response: {}", freelancer.getId(), scoreResponse.getBody());
                    }
                }

            } catch (Exception e) {
                LOGGER.error("Error processing embedding/score for freelancer {}: {}", freelancer.getId(), e.getMessage());
                // Đảm bảo rollback transaction nếu có lỗi nghiêm trọng
                throw new RuntimeException("Failed to complete freelancer setup: " + e.getMessage());
            }

            httpStatus = HttpStatus.OK;
            object = new ResponseObject("CREATED", "SUCCESS", freelancer);
        } else {
            httpStatus = HttpStatus.OK;
            object = new ResponseObject(NOT_CREATED, FAILED, freelancer);
        }
        return new ResponseEntity(object, httpStatus);
    }
    @Override
    public ResponseEntity getFreelancerByUserIdAndJobDefaultId(Long jobDefaultId) {
        ResponseObject object;
        HttpStatus httpStatus = null;
        UserCommonDTO userCommonDTO = cacheManagerService.getUser(tokenWrapper.getUid());
        Long userId = userCommonDTO.getId();
        Freelancer freelancer = freelancerRepo.findFreelancerByUserIdAndJobDefaultId(userId, jobDefaultId);
        if (freelancer != null && Optional.of(freelancer).isPresent()) {
            httpStatus = httpStatus.OK;
            object = new ResponseObject(FOUND, SUCCESS_CODE, Arrays.asList(freelancer));
        } else {
            httpStatus = httpStatus.OK;
            object = new ResponseObject(NOT_EXISTED, FAILED, freelancer);
        }
        return new ResponseEntity(object, httpStatus);
    }

    public Page<com.resourceservice.dto.CandidateDto> getPageCandidate(LocationParamsDto params){
        List<Long> ids = params.getIds();
        Long userId = params.getUserId();
        Coordinates coordinates = params.getCoordinates();
        Paging paging = params.getPaging();
        Integer page = paging.getPage();
        Integer size = paging.getSize();
        SortItem sortItem = params.getSortItem();
        TypedQuery<com.resourceservice.dto.CandidateDto> query = null;
        StringBuilder queryStr = new StringBuilder();
        queryStr.append(" SELECT new com.resourceservice.dto.CandidateDto(" +
                "f.id, " +
                "f.name, " +
                "f.birthyear, " +
                "f.gender, " +
                "f.job, " +
                "f.address, ");
                if (Utility.isExistCoordinates(coordinates)) {
                   queryStr.append("(DEGREES(ACOS(LEAST(1.0, COS(RADIANS(f.lat)) " +
                            "* COS(RADIANS(:latitude)) " +
                            "* COS(RADIANS(f.lng - :longitude)) " +
                            "+ SIN(RADIANS(f.lat)) " +
                            "* SIN(RADIANS(:latitude))))) * 111.111), ");
                }
                queryStr.append("f.des, " +
                "f.salary, " +
                "f.cv, " +
                "f.phone, " +
                "f.email, " +
                "f.lat, " +
                "f.lng) " +
                "FROM Freelancer f " +
                "WHERE f.active <> 0 ");

                if (Utility.isExistCoordinates(coordinates)) {
                queryStr.append(" AND 111.111 * " +
                "DEGREES(ACOS(LEAST(1.0, COS(RADIANS(f.lat)) " +
                "* COS(RADIANS(:latitude)) " +
                "* COS(RADIANS(f.lng - :longitude)) " +
                "+ SIN(RADIANS(f.lat)) " +
                "* SIN(RADIANS(:latitude))))) < 30 ");
                }

        if (ids != null) {
            queryStr.append(" AND f.id IN :ids ");
        }

        if(userId != null) {
            queryStr.append(" AND f.userCommon.id = :userid ");
        }

        if(sortItem.getProp().equals("distance")) {
            queryStr.append(" ORDER BY (DEGREES(ACOS(LEAST(1.0, COS(RADIANS(f.lat)) " +
                        "         * COS(RADIANS(:latitude))" +
                        "         * COS(RADIANS(f.lng - :longitude))" +
                        "         + SIN(RADIANS(f.lat)) " +
                        "         * SIN(RADIANS(:latitude))))) * 111.111) " + sortItem.getType());
        } else {
            queryStr.append(" ORDER BY f." + sortItem.getProp() + " " + sortItem.getType());
        }
        query = entityManager.createQuery(queryStr.toString(), com.resourceservice.dto.CandidateDto.class);

        if (ids != null) {
            query.setParameter("ids", ids);
        }

        if(userId != null) {
            query.setParameter("userId", userId);
        }

        if(Utility.isExistCoordinates(coordinates)) {
            query.setParameter("latitude", coordinates.getLat());
            query.setParameter("longitude", coordinates.getLng());
        }
        query.setFirstResult(page == 1 ? page - 1 :  (page - 1) * size);
        query.setMaxResults(size);
        Long totalCount = getTotalCount(params);
//        List<Job> jobs = query.getResultList();
        Page<com.resourceservice.dto.CandidateDto> candidateDtos = new PageImpl<>(query.getResultList(), PageRequest.of(page, size), totalCount);
        return candidateDtos;
    }

    private Long getTotalCount(LocationParamsDto params) {
        List<Long> ids = params.getIds();
        Long userId = params.getUserId();
        Coordinates coordinates = params.getCoordinates();
        Paging paging = params.getPaging();
        Integer page = paging.getPage();
        Integer size = paging.getSize();
        TypedQuery<Long> query = null;
        StringBuilder queryStr = new StringBuilder();

        queryStr.append("SELECT COUNT(f) FROM Freelancer f WHERE f.active <> 0 ");
        if(Utility.isExistCoordinates(coordinates)) {
            queryStr.append(" AND 111.111 * " +
                    "                                DEGREES(ACOS(LEAST(1.0, COS(RADIANS(f.lat)) " +
                    "                                * COS(RADIANS(:latitude)) " +
                    "                                * COS(RADIANS(f.lng - :longitude)) " +
                    "                                + SIN(RADIANS(f.lat)) " +
                    "                                * SIN(RADIANS(:latitude))))) < 30 ");
        }

        if (ids != null) {
            queryStr.append(" AND f.id IN :ids ");
        }

        if(userId != null) {
            queryStr.append(" AND f.userCommon.id = :userid ");
        }

        query = entityManager.createQuery(queryStr.toString(), Long.class);

        if (ids != null) {
            query.setParameter("ids", ids);
        }

        if(userId != null) {
            query.setParameter("userId", userId);
        }

        if(Utility.isExistCoordinates(coordinates)) {
            query.setParameter("latitude", coordinates.getLat());
            query.setParameter("longitude", coordinates.getLng());
        }

        return query.getSingleResult();
    }




    @Override
    public ResponseEntity<ResponseObject> listCandidate(LocationParamsDto params) {

        ResponseObject object;
        HttpStatus httpStatus = null;

        try {

            Pageable pageable = PageRequest.of(params.getPaging().getPage() - 1, params.getPaging().getSize());

            if(params.getSortItem() == null || params.getSortItem().getProp() == null || params.getSortItem().getType() == null) {
                params.setSortItem(new SortItem(ID, DESC));
            }
            Page<CandidateDto> listCandidates = getPageCandidate(params);

            if (listCandidates != null && Optional.of(listCandidates).isPresent() && !listCandidates.getContent().isEmpty()) {
                object = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                        listCandidates.getTotalElements(),
                        listCandidates.getContent().size(), listCandidates.getTotalPages(), listCandidates.getContent());
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
            log.error("listCandidate: ", e);

            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        }

         return new ResponseEntity(object, httpStatus);
    }

    private String getUserPhone() {
        SecurityContext context = SecurityContextHolder.getContext();
        Authentication authentication = context.getAuthentication();
        return (String) authentication.getPrincipal();
    }
    @Override
    public ResponseEntity<ResponseObject> listFreelancersByNote(String typeNote, LocationParamsDto params) {
        ResponseObject object;
        HttpStatus httpStatus = null;
        try {
            Pageable pageable = PageRequest.of(params.getPaging().getPage() - 1, params.getPaging().getSize());

            Page<Freelancer> listFreelancers = freelancerRepo.listFreelancersByNote(getUserPhone(), typeNote, pageable);

            if (listFreelancers != null && Optional.of(listFreelancers).isPresent() && !listFreelancers.getContent().isEmpty()) {

                Page<CandidateDto> candidateDtos = listFreelancers.map(entity -> {
                    return convertToCandidateDto(params, entity);
                });

                object = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                        candidateDtos.getTotalElements(),
                        candidateDtos.getContent().size(),
                        candidateDtos.getTotalPages(),
                        candidateDtos.getContent());

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
            log.error("listFreelancersByNote: ", e);

            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        return new ResponseEntity(object, httpStatus);
    }

    @Override
    @Transactional
    public Freelancer newFindJob(FreelancerDTO params) {
        Freelancer freelancer = new Freelancer();
        Freelancer saveFreelancer = new Freelancer();

        try {
            String introPhone = params.getIntroPhone();
            Map<String, Double> coordinate =
                    utils.convertAddressToCoordinate(params.getAddress());
            Double lat = coordinate.get(LAT);
            Double lon = coordinate.get(LNG);
            UserCommon author = userCommonRepo.findByPhoneEquals(params.getPhone());
//            adding new user common corresponding with freelancer
            if (author == null) {
                author = new UserCommon();
                author.setPin(params.getUserPin());
                author.setPhone(params.getPhone());
                author.setIntroPhone(introPhone);
                author.setRole(1);
//                author.setBonusPoint(100d);
                String body = OBJECT_MAPPER.writeValueAsString(author);
                userCommonService.createUser(body);
            }
            freelancer = Freelancer.builder()
                    .name(params.getName())
                    .job(params.getJob())
                    .workingtype(params.getWorkingtype())
                    .salary(params.getSalary())
                    .birthyear(params.getBirthyear())
                    .gender(params.getGender())
                    .phone(params.getPhone())
                    .email(params.getEmail())
                    .des(params.getDes())
                    .address(params.getAddress())
                    .lat(lat)
                    .lng(lon)
                    .cv(params.getCv())
                    .active(1)
                    .status(1)
                    .userCommon(author)
                    .creationDate(LocalDateTime.now())
                    .build();

            saveFreelancer = (Freelancer) freelancerRepo.save(freelancer);
        } catch (Exception e) {
            log.error(e.getMessage());
        }
        return saveFreelancer;
    }


    public void candidatesToCsv(Writer writer, List<CandidateDto> candidateDtos) {

        try (CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT)) {

            csvPrinter.printRecord("ID", "Name", "Age", "Gender",
                    "Job", "Address", "Distance", "Description", "Salary", "CV", "Phone", "Email");
            for (CandidateDto candidate : candidateDtos) {
                csvPrinter.printRecord(candidate.getId(),
                        candidate.getName(),
                        candidate.getAge(),
                        candidate.getGender(),
                        candidate.getJob(),
                        candidate.getAddress(),
                        candidate.getDistance(),
                        candidate.getDes(),
                        candidate.getSalary(),
                        candidate.getCv(),
                        candidate.getPhone(),
                        candidate.getEmail());
            }
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }

    @Override
    public void listCandidatesCsv(Writer writer, LocationParamsDto params) {

        List<CandidateDto> candidateDtos = null;

        try {
            List<Freelancer> freelancers = freelancerRepo.findByIds(params.getIds());

            candidateDtos = freelancers.stream().map(entity -> {
                return convertToCandidateDto(params, entity);
            }).collect(Collectors.toList());

            candidatesToCsv(writer, candidateDtos);
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }

    private CandidateDto convertToCandidateDto(LocationParamsDto params, Freelancer freelancer) {
        CandidateDto candidateDto = new CandidateDto();
        try {
            candidateDto = CandidateDto.builder()
                    .id(freelancer.getId())
                    .name(freelancer.getName())
                    .age(Year.now().getValue() - Integer.parseInt(freelancer.getBirthyear()))
                    .gender(freelancer.getGender())
                    .job(freelancer.getJob())
                    .address(freelancer.getAddress())
                    .distance(Utility.distance(params.getCoordinates().getLat(), params.getCoordinates().getLng(), freelancer.getLat(), freelancer.getLng()))
                    .des(freelancer.getDes())
                    .salary(freelancer.getSalary())
                    .cv(freelancer.getCv())
                    .phone(freelancer.getPhone())
                    .email(freelancer.getEmail())
                    .lat(freelancer.getLat())
                    .lng(freelancer.getLng())
                    .workingType(freelancer.getWorkingtype())
                    .build();
        } catch (NumberFormatException | NullPointerException exception) {
            log.error(exception.getMessage());
        }
        return candidateDto;
    }

    public FreelancerDTO convertToFreelancerDTO(Freelancer freelancer) {
        FreelancerDTO freelancerDTO = new FreelancerDTO();
        try {
            freelancerDTO.setId(freelancer.getId());
            freelancerDTO.setName(freelancer.getName());
            freelancerDTO.setJob(freelancer.getJob());
            freelancerDTO.setBirthyear(freelancer.getBirthyear());
            freelancerDTO.setGender(freelancer.getGender());
            freelancerDTO.setDes(freelancer.getDes());
            freelancerDTO.setAddress(freelancer.getAddress());
            freelancerDTO.setLat(freelancer.getLat());
            freelancerDTO.setLng(freelancer.getLng());
            freelancerDTO.setCv(freelancer.getCv());
            freelancerDTO.setActive(freelancer.getActive());
            freelancerDTO.setWorkingtype(freelancer.getWorkingtype());
            freelancerDTO.setStatus(freelancer.getStatus());
            freelancerDTO.setImg(freelancer.getImg());
            freelancerDTO.setPhone(freelancer.getPhone());
            freelancerDTO.setEmail(freelancer.getEmail());
            freelancerDTO.setRatingavr(freelancer.getRatingavr());
            freelancerDTO.setSalary(freelancer.getSalary());
            freelancerDTO.setCreationDate(freelancer.getCreationDate());

            UserCommon userCommon = freelancer.getUserCommon();
            freelancerDTO.setSendSmsNumber(userCommon.getSendSmsNumber());
            freelancerDTO.setUserPhone(userCommon.getPhone());
        } catch (NumberFormatException | NullPointerException exception) {
            log.error(exception.getMessage());
        }
        return freelancerDTO;
    }

    //những ứng viên mà người dùng đã giới thiệu
    @Override
    public ResponseEntity<ResponseObject> listFreelancerByUserId(PageableModel pageAbleModel) {
        ResponseObject object;
        HttpStatus httpStatus = null;
        UserCommonDTO userCommonDTO = cacheManagerService.getUser(tokenWrapper.getUid());
        Long userId = userCommonDTO.getId();
        try {
            Pageable pageable = PageRequest.of(pageAbleModel.getPage() - 1, pageAbleModel.getSize());
            Page<Freelancer> freelancers = freelancerRepo.listFreelanceByUserId(userId, pageable);
            if (freelancers != null && Optional.of(freelancers).isPresent() && !freelancers.getContent().isEmpty()) {
                Page<FreelancerDTO> freelancerDTOS = freelancers.map(this::convertToFreelancerDTO);
                object = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                        freelancerDTOS.getTotalElements(),
                        freelancerDTOS.getContent().size(), freelancerDTOS.getContent());
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
            log.error("listFreelancerByUserId: ", e);
            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        return new ResponseEntity(object, httpStatus);
    }




    private Freelancer getUpdatedFreelancer(FreelancerDTO freelancerDTO, Freelancer freelancer) {
        if (Utility.isValid(freelancerDTO.getName())) {
            freelancer.setName(freelancerDTO.getName());
        } else if (Utility.isValid(freelancerDTO.getJob())) {
            freelancer.setJob(freelancerDTO.getJob());
        } else if (Utility.isValid(freelancerDTO.getDes())) {
            freelancer.setJob(freelancerDTO.getDes());
        } else if (Utility.isValid(freelancerDTO.getAddress())) {
            freelancer.setAddress(freelancerDTO.getAddress());
        } else if (Utility.isValid(freelancerDTO.getCv())) {
            freelancer.setCv(freelancerDTO.getCv());
        } else if (Utility.isValid(freelancerDTO.getStatus())) {
            freelancer.setStatus(freelancerDTO.getStatus());
        } else if (Utility.isValid(freelancerDTO.getRatingavr())) {
            freelancer.setRatingavr(freelancerDTO.getRatingavr());
        } else if (Utility.isValid(freelancerDTO.getSalary())) {
            freelancer.setSalary(freelancerDTO.getSalary());
        }
        return freelancer;
    }
    @Override
    @Transactional
    public ResponseEntity<ResponseObject> updateFreelancer(FreelancerDTO freelancerDTO) {
        ResponseObject object;
        HttpStatus httpStatus;

        try {
            Optional<Freelancer> optionalFreelancer = freelancerRepo.findById(freelancerDTO.getId());

            // Kiểm tra xem freelancer có tồn tại không
            if (optionalFreelancer.isEmpty()) {
                httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
                object = new ResponseObject(ERROR, NULL_CODE, FAILED, 0L, 0, new ArrayList<>());
                LOGGER.error("Candidate with ID {} does not exist", freelancerDTO.getId());
                return new ResponseEntity<>(object, httpStatus);
            }

            Freelancer freelancer = optionalFreelancer.get();

            // Cập nhật thông tin freelancer
            freelancer = convertToFreelancer(freelancer, freelancerDTO);
            freelancer.setUpdatedate(LocalDateTime.now());

            // Lưu freelancer đã cập nhật
            Freelancer updateObj = (Freelancer) freelancerRepo.saveAndFlush(freelancer);
            LOGGER.info("Updated freelancer with ID: {}", updateObj.getId());

            // Kiểm tra xem freelancer đã được lưu
            Optional<Freelancer> fetchedFreelancer = freelancerRepo.findById(updateObj.getId());
            if (fetchedFreelancer.isEmpty()) {
                LOGGER.error("Freelancer with ID {} not found in database after update", updateObj.getId());
                httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
                object = new ResponseObject(ERROR, NULL_CODE, FAILED, 0L, 0, new ArrayList<>());
                return new ResponseEntity<>(object, httpStatus);
            }

            // Gọi API Python để lấy embedding
            try {
                String url = "http://localhost:8000/encode-freelancer";
                RestTemplate restTemplate = new RestTemplate();

                Map<String, Object> body = new HashMap<>();
                body.put("freelancerId", updateObj.getId());
                body.put("name", updateObj.getName());
                body.put("job", updateObj.getJob());
                body.put("skillDes", updateObj.getSkillDes());
                body.put("experienceDes", updateObj.getExperienceDes());
                body.put("jobTarget", updateObj.getJobTarget());
                body.put("experienceLevel", updateObj.getExperienceLevel());
                body.put("skillLevel", updateObj.getSkillLevel());

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

                ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
                LOGGER.info("Response from /encode-freelancer for freelancer {}: {}", updateObj.getId(), response.getBody());

                if (response.getStatusCode() == HttpStatus.OK && response.getBody().get("status").equals("ok")) {
                    String embedding = (String) response.getBody().get("embedding");
                    LOGGER.info("Received embedding for freelancer {}: {}", updateObj.getId(), embedding);

                    if (embedding == null || embedding.isEmpty()) {
                        LOGGER.error("Received null or empty embedding for freelancer {}", updateObj.getId());
                        throw new RuntimeException("Invalid embedding received from Python API");
                    }

                    // Cập nhật cột embedding bằng CAST
                    Query query = entityManager.createNativeQuery(
                            "UPDATE freelancer SET embedding = CAST(? AS vector) WHERE id = ?"
                    );
                    query.setParameter(1, embedding);
                    query.setParameter(2, updateObj.getId());
                    int updatedRows = query.executeUpdate();

                    if (updatedRows == 0) {
                        LOGGER.error("No rows updated for freelancerId {}", updateObj.getId());
                        throw new RuntimeException("Failed to update embedding for freelancerId " + updateObj.getId());
                    } else {
                        LOGGER.info("Embedding updated successfully for freelancer {}", updateObj.getId());
                    }
                } else {
                    LOGGER.error("Failed to create embedding for freelancer {}. Response: {}", updateObj.getId(), response.getBody());
                    throw new RuntimeException("Python API returned an error");
                }
            } catch (Exception e) {
                LOGGER.error("Error generating embedding for freelancer {}: {}", updateObj.getId(), e.getMessage());
                throw new RuntimeException("Failed to generate embedding: " + e.getMessage());
            }

            object = new ResponseObject(UPDATED, SUCCESS_CODE, SUCCESS, 0L, 0, updateObj);
            httpStatus = HttpStatus.OK;
        } catch (Exception e) {
            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
            object = new ResponseObject(ERROR, NULL_CODE, FAILED, 0L, 0, new ArrayList<>());
            LOGGER.error("Error updating freelancer: {}", e.getMessage(), e);
        }

        return new ResponseEntity<>(object, httpStatus);
    }

    @Override
    public ResponseEntity getCandidateInfo(Long freelancerId, Long jobId) {
        ResponseObject object;
        HttpStatus httpStatus;
        List<CandidateInfoProjectionV2> candidateInfoProjections = freelancerRepo.getByIdAndJobId(freelancerId, jobId);
        CandidateInfoProjectionV2 candidateInfoProjection = null;
        if (candidateInfoProjections != null && candidateInfoProjections.size() != 0) {
            LOGGER.info("getCandidateInfo jobId: " + candidateInfoProjections);
            candidateInfoProjection = candidateInfoProjections.get(0);
        } else {
            candidateInfoProjection = freelancerRepo.getByIdV2(freelancerId);
            LOGGER.info("getCandidateInfo candidateInfoProjection jd id: " + candidateInfoProjection.getJdId() + " "+ candidateInfoProjection.getMatchScore());
        }
        if (candidateInfoProjection != null) {
            LOGGER.info("getCandidateInfo candidateInfoProjection: " + candidateInfoProjection.getJdId() + " "+ candidateInfoProjection.getMatchScore());

            List<Object[]> results = userCommonRepo.getCountRatingForStar(candidateInfoProjection.getUserId());
            ProfileDTO profileDTO = ProfileDTO.builder().
                    id(candidateInfoProjection.getFreelancerId()).
                    name(candidateInfoProjection.getName()).
                    phone(candidateInfoProjection.getPhone()).
                    dateOfBirth(candidateInfoProjection.getDateOfBirth()).
                    gender(candidateInfoProjection.getGender()).
                    email(candidateInfoProjection.getEmail()).
                    avatar(candidateInfoProjection.getAvatar()).
                    province(candidateInfoProjection.getProvince()).
                    ward(candidateInfoProjection.getWard()).
                    matchScore(candidateInfoProjection.getMatchScore()).
                    skillDes(candidateInfoProjection.getSkillDes()).
                    experienceDes(candidateInfoProjection.getExperienceDes()).
                    skillLevel(candidateInfoProjection.getSkillLevel()).
                    experienceLevel(candidateInfoProjection.getExperienceLevel()).
                    salary(candidateInfoProjection.getSalary()).
                    jobTarget(candidateInfoProjection.getJobTarget()).
                    experience(candidateInfoProjection.getExperience()).
                    cv(candidateInfoProjection.getCv()).
                    status(candidateInfoProjection.getStatus()).
                    detailAddress(candidateInfoProjection.getAddress()).
                    matchScore(candidateInfoProjection.getMatchScore()).
                    build();
            RecruiterRateDTO recruiterRateDTO = new RecruiterRateDTO();
            if (results != null) {
                recruiterRateDTO = utils.getRecruiterRateForUser(results);
            }
            profileDTO.setRecruiterRate(recruiterRateDTO);
            object = new ResponseObject(FOUND, Constant.SUCCESS_CODE, SUCCESS,
                    1L,
                    1, profileDTO);
            httpStatus = HttpStatus.OK;
        } else {
            httpStatus = HttpStatus.OK;
            object = new ResponseObject(NOT_FOUND, NOT_FOUND, new ArrayList<>());
        }
        return new ResponseEntity(object, httpStatus);
    }

    @Override
    public ResponseEntity getCandidatePosts(Paging paging) {
        ResponseObject object;
        HttpStatus httpStatus = null;
        Pageable pageable = PageRequest.of(paging.getPage() - 1, paging.getSize());
        Page<CandidateInfoProjection> page = freelancerRepo.getByUserId(tokenWrapper.getUid(), pageable);
        List<CandidateInfoProjection> candidateInfoProjections = null;
        if(page != null && Optional.of(page).isPresent()) {
            candidateInfoProjections = page.getContent();
            List<CandidatePostDTO> candidatePostDTOS = candidateInfoProjections.stream().map(item -> CandidatePostDTO.builder().
                    freelancerId(item.getFreelancerId()).
                    jdId(item.getJdId()).
                    name(item.getName()).
                    jdName(item.getJdName()).
                    phone(item.getPhone()).
                    creationDate(item.getCreationDate()).
                    cv(item.getCv()).
                    creationDate(item.getCreationDate()).
                    mathScore(item.getMathScore()).
                    reasons(item.getReasons()).
                    build()).collect(Collectors.toList());
            object = new ResponseObject(FOUND, Constant.SUCCESS_CODE, SUCCESS,
                    new Long(page.getTotalElements()), candidateInfoProjections.size(),
                    page.getTotalPages(), candidatePostDTOS);
            httpStatus = HttpStatus.OK;
        } else {
            httpStatus = HttpStatus.OK;
            object = new ResponseObject(SUCCESS, SUCCESS_CODE, new ArrayList<>());
        }
        return new ResponseEntity(object, httpStatus);
    }

    public Freelancer convertToFreelancer(Freelancer freelancer, FreelancerDTO freelancerDTO) {

        try {

            //check user id exist
            if (ObjectUtils.isEmpty(freelancer.getUserCommon())) {

                if (freelancerDTO.getUserId() == null || Optional.of(freelancerDTO.getUserId()).isEmpty()) {
                    return null;
                }

                Optional<UserCommon> userCommon = userCommonRepo.findById(freelancerDTO.getUserId());

                if (userCommon.isPresent()) {
                    freelancer.setUserCommon(userCommon.get());
                }
            } else if (freelancerDTO.getUserId() != null && !freelancer.getUserCommon().getId().equals(freelancerDTO.getUserId())) { // check dto user id exist

                Optional<UserCommon> userCommon = userCommonRepo.findById(freelancerDTO.getUserId());

                if (userCommon.isPresent()) {
                    freelancer.setUserCommon(userCommon.get());
                } else {
                    freelancer.setUserCommon(null);
                }
            }
            //check name
            if (freelancerDTO.getName() != null
                    && Optional.of(freelancerDTO.getName()).isPresent()
                    && !freelancer.getName().equals(freelancerDTO.getName())) {
                freelancer.setName(freelancerDTO.getName());
            }

            //check Job
            if (freelancerDTO.getJob() != null
                    && Optional.of(freelancerDTO.getJob()).isPresent()
                    && !freelancer.getJob().equals(freelancerDTO.getJob())) {
                freelancer.setJob(freelancerDTO.getJob());
            }

            //check birthyear
            if (freelancerDTO.getBirthyear() != null
                    && Optional.of(freelancerDTO.getBirthyear()).isPresent()
                    && !freelancer.getBirthyear().equals(freelancerDTO.getBirthyear())) {
                freelancer.setBirthyear(freelancerDTO.getBirthyear());
            }

            //check gender
            if (freelancerDTO.getGender() != null
                    && Optional.of(freelancerDTO.getGender()).isPresent()
                    && !freelancer.getGender().equals(freelancerDTO.getGender())) {
                freelancer.setGender(freelancerDTO.getGender());
            }

            //check des
            if (freelancerDTO.getDes() != null
                    && Optional.of(freelancerDTO.getDes()).isPresent()
                    && !freelancer.getDes().equals(freelancerDTO.getDes())) {
                freelancer.setDes(freelancerDTO.getDes());
            }

            //check address
            //check lat
            //check lon
            if (freelancerDTO.getAddress() != null
                    && Optional.of(freelancerDTO.getAddress()).isPresent()
                    && !freelancer.getAddress().equals(freelancerDTO.getAddress())) {
                freelancer.setAddress(freelancerDTO.getAddress());

                Map<String, Double> coordinate = utils.convertAddressToCoordinate(freelancerDTO.getAddress());
                Double lat = coordinate.get(LAT);
                Double lon = coordinate.get(LNG);

                freelancer.setLat(lat);
                freelancer.setLng(lon);
            }

            //check active
            if (freelancerDTO.getActive() != null
                    && Optional.of(freelancerDTO.getActive()).isPresent()
                    && !freelancer.getActive().equals(freelancerDTO.getActive())) {
                freelancer.setActive(freelancerDTO.getActive());
            }

            //check workingtype
            if (freelancerDTO.getWorkingtype() != null
                    && Optional.of(freelancerDTO.getWorkingtype()).isPresent()
                    && !freelancer.getWorkingtype().equals(freelancerDTO.getWorkingtype())) {
                freelancer.setWorkingtype(freelancerDTO.getWorkingtype());
            }

            //check phone
            if (freelancerDTO.getPhone() != null
                    && Optional.of(freelancerDTO.getPhone()).isPresent()
                    && !freelancer.getPhone().equals(freelancerDTO.getPhone())) {
                freelancer.setPhone(freelancerDTO.getPhone());
            }

            //check email
            if (freelancerDTO.getEmail() != null
                    && Optional.of(freelancerDTO.getEmail()).isPresent()
                    && !freelancer.getEmail().equals(freelancerDTO.getEmail())) {
                freelancer.setEmail(freelancerDTO.getEmail());
            }

            //check ratingavr
            if (freelancerDTO.getRatingavr() != null
                    && Optional.of(freelancerDTO.getRatingavr()).isPresent()
                    && !freelancer.getRatingavr().equals(freelancerDTO.getRatingavr())) {
                freelancer.setRatingavr(freelancerDTO.getRatingavr());
            }

            //check salary
            if (freelancerDTO.getSalary() != null
                    && Optional.of(freelancerDTO.getSalary()).isPresent()
                    && !freelancer.getSalary().equals(freelancerDTO.getSalary())) {
                freelancer.setSalary(freelancerDTO.getSalary());
            }

            //check cv
            if (freelancerDTO.getCv() != null
                    && Optional.of(freelancerDTO.getCv()).isPresent()
                    && !freelancer.getCv().equals(freelancerDTO.getCv())) {
                freelancer.setCv(freelancerDTO.getCv());
            }

            freelancer.setUpdatedate(LocalDateTime.now());
        } catch (NumberFormatException | NullPointerException exception) {
            log.error(exception.getMessage());
        } catch (Exception e) {
            log.error("Convert DTO to Freelancer Error");
        }
        return freelancer;
    }

    @Transactional
    @Override
    public ResponseEntity<Response> deleteByIds(List<Long> ids) {
        Integer updateIdx = freelancerRepo.updateByIds(INACTIVE, ids);
        Response response;
        if (updateIdx > 0) {
            response = new Response(UPDATED, Constant.SUCCESS_CODE, SUCCESS);
        } else {
            response = new Response(ResponseMessageConstant.NOT_MODIFIED, FAILED, FAILED);
        }
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    @Transactional
    @Override
    public ResponseEntity jobsHadPostByCandidate() {
        Response object;
        HttpStatus httpStatus = null;
        Long userId = tokenWrapper.getUid();
        List<Job> jobsPosted = freelancerRepo.findJobDefaultIdsHavePostByCandidate(userId);
        if(jobsPosted != null && jobsPosted.size() > 0) {
            object = new ResponseObject(FOUND, Constant.SUCCESS_CODE, jobsPosted);
            httpStatus = httpStatus.OK;
        }else{
            object = new ResponseObject(NOT_FOUND, Constant.SUCCESS_CODE, new ArrayList<>());
            httpStatus = HttpStatus.OK;
        }
        return new ResponseEntity<>(object, httpStatus);
    }
    @Transactional
    public void deleteCVsByUserIdAndCvNames(Long userId, List<String> cvNames) {
        freelancerRepo.deleteByUserIdAndCvIn(userId, cvNames);
    }

    @Override
    @Transactional
    public OrganizationDetailResponse getOrganizationDetail(Long orgId, int page, int size) {
        // 1. Tạo đối tượng Pageable
        Pageable pageable = PageRequest.of(page, size);

        // 2. Lấy Page<Job> từ Repository
        Page<Job> jobPage =  jobRepo.findByOrganizationId(orgId, pageable);
        Page<JobDetailDto> jobDtosPage = jobPage
                .map(this::convertToJobDetailDto);

        // 4. Lấy thông tin Organization
        Organization org = organizationRepo.findById(orgId).orElse(null);
        return new OrganizationDetailResponse(org, jobDtosPage);
    }



    private JobDetailDto convertToJobDetailDto(Job job) {

        return new JobDetailDto(
                job.getId(),
                job.getJobDefault() != null ? job.getJobDefault().getId() : null,
                job.getJobDefault() != null ? job.getJobDefault().getName() : null,
                job.getName(),
                job.getAddress(),
                job.getJob(),
                job.getNumber(),
                job.getSalary(),
                null,
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
                job.getOrganizationId() != null ? orgName(job.getOrganizationId()) : null,
                job.getOrganizationId() != null ? orgAvatar(job.getOrganizationId()) : null,
                job.getOrganizationId() != null ? orgDes(job.getOrganizationId()) : null
        );
    }

    // 3 hàm nhỏ để query lấy thông tin organization
    private String orgName(Long id) {
        return organizationRepo.findById(id).map(Organization::getName).orElse(null);
    }

    private String orgAvatar(Long id) {
        return organizationRepo.findById(id).map(Organization::getAvatar).orElse(null);
    }

    private String orgDes(Long id) {
        return organizationRepo.findById(id).map(Organization::getDescription).orElse(null);
    }
}

