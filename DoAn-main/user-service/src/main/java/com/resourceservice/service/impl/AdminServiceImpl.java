package com.resourceservice.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.jober.utilsservice.model.PageableModel;
import com.jober.utilsservice.utils.DateFormaterUtility;
import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.common.CommonUtils;
import com.resourceservice.dto.*;
import com.resourceservice.dto.request.UserParamDTO;
import com.resourceservice.model.*;
import com.resourceservice.repository.*;
import com.resourceservice.service.AdminService;
import com.resourceservice.threadpool.CallableFreelancer;
import com.resourceservice.threadpool.CallableJob;

import com.resourceservice.utilsmodule.constant.Constant;
import com.resourceservice.utilsmodule.utils.Utility;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import java.io.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.Collectors;

import static com.jober.utilsservice.constant.Constant.*;
import static com.jober.utilsservice.constant.Constant.ERROR;
import static com.jober.utilsservice.constant.Constant.FAILED;
import static com.jober.utilsservice.constant.Constant.NOT_MODIFIED;
import static com.jober.utilsservice.constant.Constant.NULL_CODE;
import static com.jober.utilsservice.constant.Constant.OBJECT_MAPPER;
import static com.jober.utilsservice.constant.Constant.SUCCESS_CODE;
import static com.jober.utilsservice.constant.ResponseMessageConstant.*;
import static com.resourceservice.utilsmodule.constant.Constant.*;

@Service
public class AdminServiceImpl implements AdminService {
    @Autowired
    private UserCommonRepo userCommonRepo;
    @Autowired
    private CandidateManagementRepo candidateManagementRepo;
    @Autowired
    private RecruiterManagementRepo recruiterManagementRepo;
    @Autowired
    private FreelancerRepo freelancerRepo;
    @Autowired
    private JobRepo jobRepo;
    @Autowired
    private PaymentRepo paymentRepo;
    @Autowired
    private FreelancerServiceImpl freelancerService;
    @Autowired
    private JobServiceImpl jobService;
    @Autowired
    private UserCommonServiceImpl userCommonService;
    @Autowired
    private SettingsRepo settingsRepo;
    @Autowired
    private RequestWithDrawingRepo requestWithDrawingRepo;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    CommonUtils utils;
    private ResponseObject responseObject = null;
    public static Logger LOGGER = LoggerFactory.getLogger(UserCommonServiceImpl.class);
    @Override
    @Transactional
    public ResponseEntity<Response> deleteUser(List<Long> ids) {
        try {
            recruiterManagementRepo.deleteRecruiterManagementByUserId(ids);
            candidateManagementRepo.deleteCandidateManagementByUsers(ids);
            freelancerRepo.deleteFreelancerByUsers(ids);
            jobRepo.deleteJobByUsers(ids);
            userCommonRepo.deleteUserCommonByIds(ids);
            paymentRepo.deletePaymentByUsers(ids);
            Response response = new Response(SUCCESS, Constant.SUCCESS_CODE, DELETED);
            return new ResponseEntity(response, HttpStatus.OK);
        } catch (NullPointerException | UnsupportedOperationException e) {
            LOGGER.error("deleteAdmin: ", e);
        }
        return new ResponseEntity(FAILED, HttpStatus.NOT_IMPLEMENTED);
    }

    @Override
    @Transactional
    public ResponseEntity<ResponseObject> latestRecruiter(PageableModel pageableModel) {
        HttpStatus httpStatus = null;
        try {
            int page = pageableModel.getPage();
            int size = pageableModel.getSize();
            Pageable pageable = PageRequest.of(page - 1, size);
            LocalDateTime localDateTime = DateFormaterUtility.convertToLocalDateTimeViaInstant(new Date());
            Page<Job> jobs = jobRepo.getLatestJob(localDateTime, pageable);

            if (jobs != null && Optional.of(jobs).isPresent() && !jobs.getContent().isEmpty()) {
                List<Job> listJob = jobs.getContent();
                List<JobDTO> listJobDTO = listJob
                        .stream()
                        .map(jobService::convertToJobDTO).collect(Collectors.toList());

                responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                        jobs.getTotalElements(),
                        listJobDTO.size(), jobs.getTotalPages(), listJobDTO);
                httpStatus = HttpStatus.OK;
            } else {
                httpStatus = HttpStatus.OK;
                responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                        0L,
                        0, new ArrayList<>());
            }
        } catch (NullPointerException e) {
            httpStatus = HttpStatus.NOT_FOUND;
            responseObject = new ResponseObject(ERROR, NULL_CODE, FAILED,
                    0L,
                    0, new ArrayList<>());
            LOGGER.error("latestRecruiter: ", e);
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    @Override
    public ResponseEntity<ResponseObject> latestFreelancer(FreelancerDTO freelancerDTO) {
        HttpStatus httpStatus = null;
        try {
            PageableModel pageableModel = freelancerDTO.getPageableModel();
            int page = pageableModel.getPage();
            int size = pageableModel.getSize();
            Pageable pageable = PageRequest.of(page - 1, size);
            Page<Freelancer> freelancers = freelancerRepo.latestFreelancer(1.0, DEFAULT_PHONE, pageable);
            if (freelancers != null && Optional.of(freelancers).isPresent() && !freelancers.getContent().isEmpty()) {
                List<Freelancer> listFreelancer = freelancers.getContent();
                List<FreelancerDTO> listFreelancerDTO = listFreelancer
                        .stream()
                        .map(freelancerService::convertToFreelancerDTO).collect(Collectors.toList());

                responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                        freelancers.getTotalElements(),
                        listFreelancerDTO.size(), freelancers.getTotalPages(), listFreelancerDTO);
                httpStatus = HttpStatus.OK;
            } else {
                httpStatus = HttpStatus.OK;
                responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                        0L,
                        0, new ArrayList<>());
            }
        } catch (NullPointerException e) {
            httpStatus = HttpStatus.NOT_FOUND;
            responseObject = new ResponseObject(ERROR, NULL_CODE, FAILED,
                    0L,
                    0, new ArrayList<>());
            LOGGER.error("latestFreelancer: ", e);
        }
        return new ResponseEntity(responseObject, httpStatus);
    }


    private Job buildUpdatedJob(Job param) {
        Optional<Job> jobOptional = jobRepo.findById(param.getId());

        Job updatedJob = jobOptional.get();
        String address = param.getProvince() + ", " + param.getWard() == null? "" : (", " + param.getWard());
        Map<String, Double> coordinate =
                utils.convertAddressToCoordinate(address);
        Double lat = coordinate.get(LAT);
        Double lg = coordinate.get(LNG);

        updatedJob.setName(param.getName());
        updatedJob.setJob(param.getJob());
        updatedJob.setLat(lat);
        updatedJob.setLng(lg);
        updatedJob.setDes(param.getDes());
        updatedJob.setPhone(param.getPhone());
        updatedJob.setEmail(param.getEmail());
        updatedJob.setExpDate(param.getExpDate());
        updatedJob.setNumber(param.getNumber());
        updatedJob.setAddress(param.getAddress());
        updatedJob.setActive(param.getActive());
        updatedJob.setLevel(param.getLevel());
        updatedJob.setWebsite(param.getWebsite());
        updatedJob.setUpdateDate(LocalDateTime.now());
        updatedJob.setSalary(param.getSalary());
        updatedJob.setProvince(param.getProvince());
        updatedJob.setJobDefault(param.getJobDefault());
        updatedJob.setWard(param.getWard());
        return updatedJob;
    }
    /**
     * Try to use ReflectionUtils for update
     * @param job
     * @return
     */
    @Override
    @Transactional
    public ResponseEntity<ResponseObject> updateJob(Job job) {
        HttpStatus httpStatus = null;
        ResponseObject responseObject = null;  // Khởi tạo để tránh lỗi compile nếu cần
        try {
            Job updatedJob = (Job) jobRepo.save(buildUpdatedJob(job));

            // Kiểm tra xem Job đã được lưu
            Optional<Job> fetchedJob = jobRepo.findById(updatedJob.getId());
            if (!fetchedJob.isPresent()) {
                httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
                responseObject = new ResponseObject("FAILED_TO_SAVE", "500", "Failed to update job", 0L, 0, new ArrayList<>());
                return new ResponseEntity<>(responseObject, httpStatus);
            }

            // Gọi encode-job để cập nhật embedding (tương tự save)
            try {
                String url = "http://localhost:8000/encode-job";
                RestTemplate restTemplate = new RestTemplate();

                Map<String, Object> payload = new HashMap<>();
                payload.put("jobId", updatedJob.getId());
                payload.put("name", updatedJob.getName());
                payload.put("des", updatedJob.getDes());
                payload.put("requiredExperienceLevel", updatedJob.getRequiredExperienceLevel() != null ? updatedJob.getRequiredExperienceLevel() : 0);
                payload.put("requiredSkillLevel", updatedJob.getRequiredSkillLevel() != null ? updatedJob.getRequiredSkillLevel() : 0);
                payload.put("requiredSkill", updatedJob.getRequiredSkill() != null ? updatedJob.getRequiredSkill() : "");
                payload.put("workingType", updatedJob.getWorkingType() != null ? updatedJob.getWorkingType() : 0);
                payload.put("salary",
                        updatedJob.getSalary() != null ? Double.parseDouble(updatedJob.getSalary()) : 0.0);
                payload.put("province", updatedJob.getProvince());

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
                    query.setParameter(2, updatedJob.getId());
                    int updatedRows = query.executeUpdate();
                } else {
                    throw new RuntimeException("Python API returned an error");
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to generate embedding: " + e.getMessage());
            }

            if (updatedJob != null) {
                responseObject = new ResponseObject(UPDATED, SUCCESS_CODE, SUCCESS,
                        1L,
                        1, Arrays.asList(updatedJob));
                httpStatus = HttpStatus.OK;
            } else {
                httpStatus = HttpStatus.NOT_MODIFIED;
                responseObject = new ResponseObject(NOT_MODIFIED, NOT_MODIFY, FAILED,
                        0L,
                        0, new ArrayList<>());
            }
        } catch (NullPointerException e) {
            httpStatus = HttpStatus.NOT_MODIFIED;
            responseObject = new ResponseObject(ERROR, NOT_MODIFY, FAILED,
                    0L,
                    0, new ArrayList<>());
            LOGGER.error("updateJob: ", e);
        } catch (Exception e) {
            // Xử lý exception từ encode-job
            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
            responseObject = new ResponseObject("INTERNAL_ERROR", "500", "Update failed: " + e.getMessage(),
                    0L, 0, new ArrayList<>());
            LOGGER.error("updateJob failed: ", e);
        }
        return new ResponseEntity<>(responseObject, httpStatus);
    }

    @Override
    @Transactional
    public ResponseEntity<ResponseObject> deleteFreelancerByIds(List<Long> freelancerIds) {
        HttpStatus httpStatus = null;
        try {
            Integer isDeleted = freelancerRepo.deleteFreelancerByIds(freelancerIds);
            if (isDeleted != null && isDeleted != 0) {
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
            httpStatus = HttpStatus.NOT_FOUND;
            responseObject = new ResponseObject(ERROR, NULL_CODE, FAILED,
                    0L,
                    0, new ArrayList<>());
            LOGGER.error("deleteFreelancerByIds: ", e);
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    @Override
    @Transactional
    public ResponseEntity<ResponseObject> updateFreelancerById(FreelancerDTO freelancerDTO) {
        HttpStatus httpStatus = null;
        try {
            Integer status = freelancerDTO.getStatus();
            Long freelancerId = freelancerDTO.getId();
            Integer isUpdated = freelancerRepo.updateFreelancerById(status, freelancerId);
            if (isUpdated != null && isUpdated != 0) {
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
            httpStatus = HttpStatus.NOT_MODIFIED;
            responseObject = new ResponseObject(ERROR, NULL_CODE, FAILED,
                    0L,
                    0, new ArrayList<>());
            LOGGER.error("updateFreelancerById: ", e);
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    private Page<UserCommon> getUserCommons(UserParamDTO userParamDTO) {
        Paging paging = userParamDTO.getPaging();
        int page = paging.getPage();
        int size = paging.getSize();
        Pageable pageable = PageRequest.of(page - 1, size);

        // Nếu null thì lấy mặc định
        List<Integer> defaultVals = Arrays.asList(0, 1, 2, 3, 4, 5);
        List<Integer> roles = userParamDTO.getRoles() != null ? userParamDTO.getRoles() : defaultVals;
        List<Integer> ratings = userParamDTO.getRatings() != null ? userParamDTO.getRatings() : defaultVals;

        String keySearch = userParamDTO.getKeySearch();
        if (keySearch != null && !keySearch.isEmpty()) {
            keySearch = "%" + keySearch.toLowerCase() + "%";
            return userCommonRepo.findUsersByKeySearch(keySearch, ratings, roles, pageable);
        } else {
            return userCommonRepo.findUsers(ratings, roles, pageable);
        }
    }

    @Override
    public ResponseEntity<ResponseObject> getListUsers(UserParamDTO userParamDTO) {
        HttpStatus httpStatus = null;
        Page<UserCommon> userCommons = getUserCommons(userParamDTO);

        if (userCommons != null && Optional.of(userCommons).isPresent() && !userCommons.getContent().isEmpty()) {
            List<UserCommon> listUserCommon = userCommons.getContent();
            List<UserCommonDTO> listUserCommonDTO = listUserCommon
                    .stream()
                    .map(userCommonService::buildUserCommonDTO).collect(Collectors.toList());

            responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                    userCommons.getTotalElements(),
                    listUserCommonDTO.size(), userCommons.getTotalPages(), listUserCommonDTO);
            httpStatus = HttpStatus.OK;
        } else {
            httpStatus = HttpStatus.OK;
            responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                    0L,
                    0, new ArrayList<>());
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    @Override
    public ResponseEntity<ResponseObject> getBlockedUsers(UserCommonDTO userCommonDTO) {
        HttpStatus httpStatus = null;
        try {
            PageableModel pageableModel = userCommonDTO.getPageableModel();
            int page = pageableModel.getPage();
            int size = pageableModel.getSize();
            Pageable pageable = PageRequest.of(page - 1, size);
            Page<UserCommon> userCommons = userCommonRepo.findBlockedUsers("0", pageable);
            if (userCommons != null && Optional.of(userCommons).isPresent() && !userCommons.getContent().isEmpty()) {
                List<UserCommon> listUserCommon = userCommons.getContent();
                List<UserCommonDTO> listUserCommonDTO = listUserCommon
                        .stream()
                        .map(userCommonService::buildUserCommonDTO).collect(Collectors.toList());

                responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                        userCommons.getTotalElements(),
                        listUserCommonDTO.size(), listUserCommonDTO);
                httpStatus = HttpStatus.OK;
            } else {
                httpStatus = HttpStatus.OK;
                responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                        0L,
                        0, new ArrayList<>());
            }
        } catch (NullPointerException e) {
            httpStatus = HttpStatus.NOT_FOUND;
            responseObject = new ResponseObject(ERROR, NULL_CODE, FAILED,
                    0L,
                    0, new ArrayList<>());
            LOGGER.error("getBlockedUsers: ", e);
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    @Override
    public ResponseEntity<ResponseObject> statisticalUserByTime(UserCommonDTO userCommonDTO) {
        HttpStatus httpStatus = null;
        try {
            LocalDateTime startDate = userCommonDTO.getStartYear();
            LocalDateTime endDate = userCommonDTO.getEndYear();
            List<UserCommon> userCommons = userCommonRepo.statisticalUserByTime(userCommonDTO.getRoles(), startDate, endDate);
            if (userCommons != null && Optional.of(userCommons).isPresent()) {
//                List<UserCommon> listUserCommon = userCommons.getContent();
                List<UserCommonDTO> listUserCommonDTO = userCommons
                        .stream()
                        .map(userCommonService::buildUserCommonDTO).collect(Collectors.toList());
                Map statisticalUsers = statisticalUsers(userCommonDTO.getStatisticalType(), userCommonDTO.getStartYear(), userCommonDTO.getEndYear(), userCommons);
                responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                        (long) userCommons.size(),
                        listUserCommonDTO.size(), statisticalUsers);
                httpStatus = HttpStatus.OK;
            } else {
                httpStatus = HttpStatus.NOT_FOUND;
                responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                        0L,
                        0, new ArrayList<>());
            }
        } catch (NullPointerException e) {
            httpStatus = HttpStatus.NOT_FOUND;
            responseObject = new ResponseObject(ERROR, NULL_CODE, FAILED,
                    0L,
                    0, new ArrayList<>());
            LOGGER.error("statisticalUserByTime: ", e);
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    @Override
    public ResponseEntity<ResponseObject> revenueInRealtime() {
        HttpStatus httpStatus = null;
        try {
            Double revenueInRealtime = paymentRepo.revenueInRealtime();
            if (revenueInRealtime != null && Optional.of(revenueInRealtime).isPresent() ) {
                responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                        0L,
                        0, revenueInRealtime);
                httpStatus = HttpStatus.OK;
            } else {
                httpStatus = HttpStatus.NOT_FOUND;
                responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                        0L,
                        0, new ArrayList<>());
            }
        } catch (NullPointerException e) {
            httpStatus = HttpStatus.NOT_FOUND;
            responseObject = new ResponseObject(ERROR, NULL_CODE, FAILED,
                    0L,
                    0, new ArrayList<>());
            LOGGER.error("revenueInRealtime: ", e);
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    @Override
    public ResponseEntity<ResponseObject> statisticalRevenueByTime(PaymentDTO paymentDTO) {
        LocalDateTime startDate = DateFormaterUtility.getFirstDateFromSpecificYear(paymentDTO.getStartYear());
        LocalDateTime endDate = DateFormaterUtility.getFirstDateFromSpecificYear(paymentDTO.getEndYear());
        HttpStatus httpStatus = null;
        try {
            List<Payment> payments = paymentRepo.statisticalRevenueByTime(startDate, endDate);
            Map map = null;
            if (payments != null && Optional.of(payments).isPresent() && !payments.isEmpty()) {
                map = statisticalPayment(paymentDTO.getStatisticalType(), paymentDTO.getStartYear(), paymentDTO.getEndYear(), payments);
                responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                        0L,
                        0, map);
                httpStatus = HttpStatus.OK;
            } else {
                httpStatus = HttpStatus.NOT_FOUND;
                responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                        0L,
                        0, new ArrayList<>());
            }
        } catch (NullPointerException e) {
            httpStatus = HttpStatus.NOT_FOUND;
            responseObject = new ResponseObject(ERROR, NULL_CODE, FAILED,
                    0L,
                    0, new ArrayList<>());
            LOGGER.error("revenueInRealtime: ", e);
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    @Override
    public ResponseEntity<ResponseObject> bonusForUser(BonusDTO bonusDTO) {
        HttpStatus httpStatus = null;
        try {
            Map mapResult = new HashMap();
            List<Settings> settings = settingsRepo.findSetting(bonusDTO.getKeyword());
            if (settings != null && Optional.of(settings).isPresent() ) {
                mapResult.put("settings", settings);
            }
            Double revenueInRealtime = paymentRepo.revenueInRealtime();
            if (revenueInRealtime != null && Optional.of(revenueInRealtime).isPresent() ) {
                mapResult.put("revenueInRealtime", revenueInRealtime);
            }
            PageableModel pageableModel = bonusDTO.getPageableModel();
            int page = pageableModel.getPage();
            int size = pageableModel.getSize();
            Pageable pageable = PageRequest.of(page - 1, size);
            Page<RequestWithDrawing> requestWithDrawings = requestWithDrawingRepo.findRequestWithDrawing(pageable);
            if (requestWithDrawings != null && Optional.of(requestWithDrawings).isPresent() ) {
                List<RequestWithDrawing> requestWithDrawingList = requestWithDrawings.getContent();
                mapResult.put("requestWithDrawings", requestWithDrawingList);
            }
            if(!mapResult.isEmpty()) {
                responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                        0L,
                        0, mapResult);
                httpStatus = HttpStatus.OK;
            } else {
                httpStatus = HttpStatus.NOT_FOUND;
                responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                        0L,
                        0, new ArrayList<>());
            }
        } catch (NullPointerException e) {
            httpStatus = HttpStatus.NOT_FOUND;
            responseObject = new ResponseObject(ERROR, NULL_CODE, FAILED,
                    0L,
                    0, new ArrayList<>());
            LOGGER.error("bonusForUser: ", e);
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    @Override
    @Transactional
    public ResponseEntity<ResponseObject> updateBonusForUser(BonusDTO bonusDTO) {
        HttpStatus httpStatus = null;
        try {
            Integer isUpdated = settingsRepo.updateSettings(bonusDTO.getData(), bonusDTO.getKeyword());
            if (isUpdated != null) {
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
            httpStatus = HttpStatus.NOT_MODIFIED;
            responseObject = new ResponseObject(ERROR, NOT_MODIFY, FAILED,
                    0L,
                    0, new ArrayList<>());
            LOGGER.error("updateJob: ", e);
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    /**
     * read data from xlsx file, then save data to database, using multi thread
     * @param scanObject
     * @param multi
     * @return
     */
    @Override
    public ResponseEntity<Response> scanUser(String scanObject, MultipartFile multi) {
        // create a list to hold the Future object associated with Callable
        List<Future<ResponseObject>> listFutures = new ArrayList<>();
        // Get ExecutorService from Executors utility class, thread pool size is 5
        ExecutorService executor = Executors.newFixedThreadPool(5);
        Response response = null;
        HttpStatus httpStatus = null;

        try {
            int randomNum = Utility.generatePin();
            File dir = new File(".");
            File file = new File(dir.getCanonicalPath() + File.separator + randomNum + "in.xlsx");
            LOGGER.info("scanUser path file: " + file.getAbsolutePath());
            multi.transferTo(file);
            FileInputStream fis = new FileInputStream(file);
            XSSFWorkbook wb = new XSSFWorkbook(fis);
            XSSFSheet sheet = wb.getSheetAt(0);
            Iterator<Row> itr = sheet.iterator();
            int rowNum = sheet.getLastRowNum();
            int j = 1;
//            read each line in file
            while (j <= rowNum) {
                Row row = sheet.getRow(j);
                j ++;
                Iterator<Cell> cellIterator = row.cellIterator();
                int i = 0;
                Freelancer freelancer = new Freelancer();
                Job job = new Job();
                UserCommonDTO userCommonDTO = new UserCommonDTO();
//                read each cell in row
                while (cellIterator.hasNext()) {
                    Cell cell = cellIterator.next();
                    if (FREELANCER.equals(scanObject)) {
                        buildFreelancer(i, getCellVal(cell), freelancer, userCommonDTO);
                        if (freelancer.getUserCommon() == null) {
                            continue;
                        }
                    } else if (JOB.equals(scanObject)) {
                        buildJob(i, getCellVal(cell), job, userCommonDTO);
                        if (job.getUserCommon() == null) {
                            continue;
                        }
                    }
                    i ++;
                }
                freelancer.setCreationDate(DateFormaterUtility.convertToLocalDateTimeViaInstant(new Date()));
                freelancer.setUpdatedate(DateFormaterUtility.convertToLocalDateTimeViaInstant(new Date()));
                userCommonDTO.setCreationDate(DateFormaterUtility.convertToLocalDateTimeViaInstant(new Date()));
                userCommonDTO.setUpdateDate(DateFormaterUtility.convertToLocalDateTimeViaInstant(new Date()));

                CallableJob callableJob;
                CallableFreelancer callableFreelancer;
                Future<ResponseObject> futureJob;
                Future<ResponseObject> futureFreelancer;
                if (FREELANCER.equals(scanObject)) {
                    callableFreelancer = new CallableFreelancer(freelancer, freelancerRepo);
                    futureFreelancer = executor.submit(callableFreelancer);
                    listFutures.add(futureFreelancer);
                } if (JOB.equals(scanObject)) {
                    callableJob = new CallableJob(job, jobRepo);
                    futureJob = executor.submit(callableJob);
                    listFutures.add(futureJob);
                }
            }
            executor.shutdown();

            // Wait until all threads are finished
            while (!executor.isTerminated()) {
                // Running ...
            }
            for (Future<ResponseObject> f : listFutures) {
                try {
                    ResponseObject responseObject = f.get();
                    LOGGER.info("CallableUserCommon:" + responseObject.toString());
                    httpStatus = HttpStatus.OK;
                    response = new Response(SUCCESS, Constant.SUCCESS_CODE, SUCCESS);
                } catch (InterruptedException | ExecutionException e) {
                    httpStatus = HttpStatus.NOT_IMPLEMENTED;
                    response = new Response(FAILED, null, FAILED);
                    LOGGER.error("process in thread pool of scanUser get error:" + e);
                }
            }
        } catch (Exception e) {
            httpStatus = HttpStatus.NOT_IMPLEMENTED;
            response = new Response(FAILED, null, FAILED);
            LOGGER.error("scanUser get error:" + e);
        }
        return new ResponseEntity(response, httpStatus);
    }

    private Object getCellVal(Cell cell) {
        try {
            if (DateUtil.isCellDateFormatted(cell)) {
                Date date = cell.getDateCellValue();
                return date;
            }
        } catch (IllegalStateException e) {
            LOGGER.error("getCellVal: " + e);
        }
        CellType cellType = cell.getCellType();
        if (cellType == CellType.STRING) return cell.getStringCellValue();
        if (cellType == CellType.NUMERIC) return String.valueOf(cell.getNumericCellValue());
        return new String();
    }
//    getLatLg()
    private void buildFreelancer(int cellIdx, Object cellValue, Freelancer freelancer, UserCommonDTO userCommonDTO) {
        switch (cellIdx) {
            case 0:
                freelancer.setPhone(cellValue.toString());
                userCommonDTO.setPhone(cellValue.toString());
                UserCommon userCommon = getUserCommon(userCommonDTO);
                freelancer.setUserCommon(userCommon);
                break;
//            get lat lg from address
            case 1:
                freelancer.setAddress(cellValue.toString());
                Map<String, Double> coordinateMap = utils.convertAddressToCoordinate(cellValue.toString());
                freelancer.setLat(coordinateMap.get(LAT));
                freelancer.setLng(coordinateMap.get(LNG));
                break;
            case 2: freelancer.setName(cellValue.toString()); break;
            case 3: freelancer.setJob(cellValue.toString()); break;
            case 4: freelancer.setSalary(cellValue.toString()); break;
            case 5: freelancer.setBirthyear(cellValue.toString()); break;
            case 6: freelancer.setGender(cellValue.toString()); break;
            case 7: freelancer.setDes(cellValue.toString()); break;
        }
//        return freelancer;
    }

    private UserCommon getUserCommon(UserCommonDTO userCommonDTO) {
        try {
            String body = OBJECT_MAPPER.writeValueAsString(userCommonDTO);
            ResponseObject responseObject = userCommonService.createUser(body);
            List<UserCommon> userCommons = (List<UserCommon>) responseObject.getData();
            return userCommons.get(0);
        } catch (JsonProcessingException | NullPointerException e) {
            LOGGER.error("getUserId get error: " + e);
        }
        return null;
    }

    private void buildJob(int cellIdx, Object cellValue, Job job, UserCommonDTO userCommonDTO) {
        switch (cellIdx) {
            case 0:
                job.setPhone(cellValue.toString());
                userCommonDTO.setPhone(cellValue.toString());
                UserCommon userCommon = getUserCommon(userCommonDTO);
                job.setUserCommon(userCommon);
                break;
//            get lat lg from address
            case 1: job.setEmail(cellValue.toString()); break;
            case 2: job.setName(cellValue.toString()); break;
            case 3:
                job.setAddress(cellValue.toString());
                Map<String, Double> coordinateMap = utils.convertAddressToCoordinate(cellValue.toString());
                job.setLat(coordinateMap.get(LAT));
                job.setLng(coordinateMap.get(LNG));
                break;
            case 4: job.setJob(cellValue.toString()); break;
            case 5: job.setSalary(cellValue.toString()); break;
            case 6: job.setDes(cellValue.toString()); break;
//            post date but haven't yet
            case 7: ; break;
            case 8:
                try {
                    LocalDateTime expDate = DateFormaterUtility.convertToLocalDateTimeViaInstant((Date) cellValue);
                    job.setExpDate(expDate);
                } catch (IllegalArgumentException |ClassCastException e) {
                    LOGGER.error("buildJob: " + e);
                }
                break;
            case 9:
                try {
                    job.setNumber(Integer.parseInt(cellValue.toString()));
                } catch (NumberFormatException e) {
                    LOGGER.error("buildJob the hired number:" + e);
                }
                break;
            case 10: job.setWebsite(cellValue.toString()); break;
        }
    }

    private Map<Integer, Double> statisticalPayment(List<Payment> payments, Map<Integer, Double> mapTotalMoneyByTime, int i, LocalDateTime startDate, LocalDateTime endDate) {
        Double totalMoney = 0.0D;
        if (mapTotalMoneyByTime.containsKey(i)) {
            totalMoney += mapTotalMoneyByTime.get(i);
        }
        for (int j = 0; j < payments.size(); j ++) {
            if (payments.get(j).getCreationdate().isAfter(startDate) && payments.get(j).getCreationdate().isBefore(endDate)) {
                totalMoney += payments.get(j).getTotalMoney();
            }
        }
        mapTotalMoneyByTime.put(i, totalMoney);
        return mapTotalMoneyByTime;
    }

    private Map<Integer, Double> statisticalPayment(String statisticalType, Integer startY, Integer endY, List<Payment> payments) {
        LocalDateTime startDate = DateFormaterUtility.getFirstDateFromSpecificYear(startY);
        LocalDateTime endDate = DateFormaterUtility.getEndDateFromSpecificYear(endY);
        Map<Integer, Double> mapTotalMoneyByTime = new HashMap<>();
        int startMonth = startDate.getMonthValue();
        int endMonth = endDate.getMonthValue();
        switch (statisticalType) {
            case STATISTICAL_BY_MONTH:
                for (int i = startMonth; i <= endMonth; i ++) {
                    LocalDateTime startDatePerMonth = DateFormaterUtility.getFirstDateFromSpecificYearMonth(startY, i);
                    LocalDateTime endDatePerMonth = DateFormaterUtility.getEndDateFromSpecificYearMonth(startY, i);
//                    if (mapTotalMoneyByTime.containsKey(i)) {
//                        totalMoney += mapTotalMoneyByTime.get(i);
//                    }0
//                    for (int j = 0; j < payments.size(); j ++) {
//                        if (payments.get(j).getCreationdate().isAfter(startDatePerMonth) && payments.get(j).getCreationdate().isBefore(endDatePerMonth)) {
//                            totalMoney += payments.get(j).getTotalMoney();
//                        }
//                    }
                    mapTotalMoneyByTime = statisticalPayment(payments, mapTotalMoneyByTime, i, startDatePerMonth, endDatePerMonth);
                }
                break;
            case STATISTICAL_BY_QUARTER:
                for (int i = startMonth; i <= endMonth; i  = i + 2) {
                    LocalDateTime startDatePerMonth = DateFormaterUtility.getFirstDateFromSpecificYearMonth(startY, i);
                    LocalDateTime endDatePerMonth = DateFormaterUtility.getEndDateFromSpecificYearMonth(startY, i);
                    Double totalMoney = 0.0D;
                    if (mapTotalMoneyByTime.containsKey(i)) {
                        totalMoney += mapTotalMoneyByTime.get(i);
                    }
                    for (int j = 0; j < payments.size(); j ++) {
                        if (payments.get(j).getCreationdate().isAfter(startDatePerMonth) && payments.get(j).getCreationdate().isBefore(endDatePerMonth)) {
                            totalMoney ++;
                        }
                    }
                    mapTotalMoneyByTime.put(i, totalMoney);
                }
                break;
            case STATISTICAL_BY_YEAR:
                for (int i = startY; i <= endY; i ++) {
                    LocalDateTime startDatePerYear = DateFormaterUtility.getFirstDateFromSpecificYear(i);
                    LocalDateTime endDatePerYear = DateFormaterUtility.getEndDateFromSpecificYear(i);
                    Double totalMoney = 0.0D;
                    if (mapTotalMoneyByTime.containsKey(i)) {
                        totalMoney += mapTotalMoneyByTime.get(i);
                    }
                    for (int j = 0; j < payments.size(); j ++) {
                        if (payments.get(j).getCreationdate().isAfter(startDatePerYear) && payments.get(j).getCreationdate().isBefore(endDatePerYear)) {
                            totalMoney ++;
                        }
                    }
                    mapTotalMoneyByTime.put(i, totalMoney);
                }
                break;
        }
        return mapTotalMoneyByTime;
    }

    private Map<String, Integer> statisticalUsers(String statisticalType, LocalDateTime startDate, LocalDateTime endDate, List<UserCommon> userCommons) {
        Map<String, Integer> mapUserNumbers = new HashMap<>();
        switch (statisticalType) {
            case STATISTICAL_BY_MONTH:
                for (int i = 0; i < userCommons.size(); i ++) {
                    LocalDateTime creationDate = userCommons.get(i).getCreationDate();
                    int year = creationDate.getYear();
                    int month = creationDate.getMonthValue();
                    LocalDateTime startDatePerMonth = DateFormaterUtility.getFirstDateFromSpecificYearMonth(year, month);
                    LocalDateTime endDatePerMonth = DateFormaterUtility.getEndDateFromSpecificYearMonth(year, month);
                    int userNum = 1;
                    String monthStr = year + "-" + month;
                    if (mapUserNumbers.containsKey(monthStr)) {
                        userNum += mapUserNumbers.get(monthStr);
                    }
                    mapUserNumbers.put(monthStr, userNum);
                }
                break;
            case STATISTICAL_BY_YEAR:
                int startY = startDate.getYear();
                int endY = startDate.getYear();
                for (int i = startY; i <= endY; i ++) {
                    Integer userNum = 0;
                    LocalDateTime startDatePerYear = DateFormaterUtility.getFirstDateFromSpecificYear(i);
                    LocalDateTime endDatePerYear = DateFormaterUtility.getEndDateFromSpecificYear(i);
                    for (int j = 0; j < userCommons.size(); j ++) {
//                        compare creation date with the first date of month j and the end date of month j
                        if (userCommons.get(j).getCreationDate().isAfter(startDatePerYear) && userCommons.get(j).getCreationDate().isBefore(endDatePerYear)) {
                            userNum ++;
                        }
                    }
                    if (mapUserNumbers.containsKey(i)) {
                        userNum += mapUserNumbers.get(i);
                    }
                    mapUserNumbers.put(String.valueOf(i), userNum);
                }
                break;
        }
        return mapUserNumbers;
    }
}
