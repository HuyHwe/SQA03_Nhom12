package com.resourceservice.service.impl;

import com.jober.utilsservice.constant.ResponseMessageConstant;
import com.jober.utilsservice.model.PageableModel;
import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.dto.CandidateManagementDTO;
import com.resourceservice.dto.MyPostDto;
import com.resourceservice.dto.UserCommonDTO;
import com.resourceservice.dto.request.FreelancerMatch;
import com.resourceservice.dto.request.FreelancerStatsRequest;
import com.resourceservice.dto.request.FreelancerStatsResponse;
import com.resourceservice.exception.CommonException;
import com.resourceservice.interceptor.BearerTokenWrapper;
import com.resourceservice.model.*;
import com.resourceservice.model.projection.FreelancerProjection;
import com.resourceservice.model.projection.JobProjection;
import com.resourceservice.repository.*;
import com.resourceservice.service.RecruiterService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import javax.persistence.EntityManager;
import java.io.Writer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static com.jober.utilsservice.constant.Constant.SUCCESS_CODE;
import static com.jober.utilsservice.constant.ResponseMessageConstant.*;
import static com.resourceservice.utilsmodule.constant.Constant.*;
@Service
@Log4j2
public class RecruiterServiceImpl implements RecruiterService {

    @Autowired
    private JobRepo jobRepo;
    @Autowired
    private OrganizationRepo organizationRepo;

    @Autowired
    private RecruiterManagementRepo repo;

    @Autowired
    private UserCommonRepo userCommonRepo;
    @Autowired
    private FreelancerRepo freelancerRepo;
    @Autowired
    private BearerTokenWrapper tokenWrapper;

    private  RestTemplate restTemplate;

    @Autowired
    private EntityManager entityManager;
    public RecruiterServiceImpl(BearerTokenWrapper tokenWrapper) {
        this.tokenWrapper = tokenWrapper;
    }
    @Override
    public ResponseEntity<ResponseObject> addNewRecruiter(RecruiterManagement recruiterManagement) {
        HttpStatus httpStatus = null;
        ResponseObject object;
        RecruiterManagement isSaved = (RecruiterManagement) repo.save(recruiterManagement);
        if(isSaved != null) {
            httpStatus = HttpStatus.OK;
            object = new ResponseObject(SUCCESS, CREATED, SUCCESS,
                    0L,
                    0, isSaved);
        } else {
            httpStatus = HttpStatus.NOT_MODIFIED;
            object = new ResponseObject(NOT_MODIFIED, FAILED, NOT_MODIFIED, 0L, 0, null);
        }
        return new ResponseEntity(object, httpStatus);
    }

    @Override
    public ResponseEntity<String> addNewCandidate(Long userId, Long freelancerId, String note) {

        try {

            RecruiterManagement entity = new RecruiterManagement();

            Optional<UserCommon> userCommon = userCommonRepo.findById(userId);

            entity.setUserCommon(userCommon.get());
            entity.setFreelancerid(freelancerId);
            entity.setStatus("1");
            entity.setNote("0");
            entity.setCreationdate(LocalDateTime.now());
            entity.setUpdatedate(LocalDateTime.now());

            repo.save(entity);
        }catch (Exception e){
            log.error(e.getMessage());
            throw new CommonException("RecruiterManagement", HttpStatus.INTERNAL_SERVER_ERROR, "candidate.insert.error");
        }

        return new ResponseEntity<>(SUCCESS, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<String> updateStatusCandidate(Long userId, Long freelancerId, String note) {

        try {
            Optional<RecruiterManagement> entity = repo.findByUserAndFreelancer(userId, freelancerId);

            if (entity.isPresent()){
                entity.get().setStatus(note);
            }

            repo.save(entity);
        }catch (Exception e){
            log.error(e.getMessage());
            throw new CommonException("RecruiterManagement", HttpStatus.INTERNAL_SERVER_ERROR, "candidate.update.status.error");
        }

        return new ResponseEntity<>(SUCCESS, HttpStatus.OK);
    }

    @Override
    public ResponseEntity listPost(PageableModel pageAbleModel) {
        ResponseObject object;
        HttpStatus httpStatus = null;
        Long userId = tokenWrapper.getUid();
        try {
            Pageable pageable = PageRequest.of(pageAbleModel.getPage() - 1, pageAbleModel.getSize());
            Page<JobProjection> jobs = jobRepo.findJobsByUserId(userId, pageable);
            if (jobs != null && Optional.of(jobs).isPresent() && !jobs.getContent().isEmpty()) {
                object = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                        jobs.getTotalElements(),
                        jobs.getContent().size(), jobs.getTotalPages(),
                        jobs.getContent());
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
            httpStatus = HttpStatus.NOT_FOUND;
        }
        return new ResponseEntity(object, httpStatus);
    }

    @Override
    public void listPostCSV(Writer writer, List<Long> listJobId) {

        List<MyPostDto> myPostDtos = null;
        try (CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT)) {
            List<Job> jobs = jobRepo.findByIds(listJobId);

            myPostDtos = jobs.stream().map(item -> {
                return convertToMyPostDto(item);
            }).collect(Collectors.toList());

            csvPrinter.printRecord("ID", "Name", "Job", "Salary", "Description",
                    "Address", "CV", "Active", "Created Date", "Expire Date");
            for (MyPostDto item : myPostDtos) {
                csvPrinter.printRecord(item.getId(),
                        item.getName(),
                        item.getJob(),
                        item.getSalary(),
                        item.getDes(),
                        item.getAddress(),
                        item.getCv(),
                        item.getActive(),
                        item.getCreationdate(),
                        item.getExpdate());
            }
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }

    @Override
    public ResponseEntity updateNoteRecruiterManagement(Long userId, Long freelancerId, String note) {
        try {
            Optional<RecruiterManagement> entity = repo.findByUserAndFreelancer(userId, freelancerId);
            if (entity.isPresent()){
                entity.get().setNote(note);
            }
            repo.save(entity);
        } catch (Exception e){
            log.error(e.getMessage());
            throw new CommonException("RecruiterManagement", HttpStatus.INTERNAL_SERVER_ERROR, "candidate.update.note.error");
        }
        return new ResponseEntity<>(SUCCESS, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<ResponseObject> findAppliedCandidate(Paging paging) {
        ResponseObject object;
        HttpStatus httpStatus = null;
        Pageable pageable = PageRequest.of(paging.getPage() - 1, paging.getSize());
        Page<FreelancerProjection> page = freelancerRepo.findAppliedCandidate(tokenWrapper.getUid(), pageable);

        if(page != null && Optional.of(page).isPresent()) {
            List<FreelancerProjection> list = page.getContent();
            httpStatus = HttpStatus.OK;
            object = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                    page.getTotalElements(),
                    list.size(), list);
        } else {
            httpStatus = HttpStatus.OK;
            object = new ResponseObject(NOT_FOUND, SUCCESS, null);
        }
        return new ResponseEntity(object, httpStatus);
    }
    @Override
    public ResponseEntity<ResponseObject> getOrganizationName() {
        ResponseObject object;
        HttpStatus httpStatus;

        List<Object[]> resultList = organizationRepo.findAllOrganizationIdAndName();
        Map<Long, String> orgMap = new HashMap<>();

        if (resultList != null && !resultList.isEmpty()) {
            for (Object[] row : resultList) {
                Long id = (Long) row[0];
                String name = (String) row[1];
                orgMap.put(id, name);
            }

            object = new ResponseObject("FOUND", "SUCCESS_CODE", "SUCCESS",
                    (long) orgMap.size(), orgMap.size(), orgMap);
            httpStatus = HttpStatus.OK;
        } else {
            object = new ResponseObject("NOT_FOUND", "SUCCESS", null);
            httpStatus = HttpStatus.OK;
        }

        return new ResponseEntity<>(object, httpStatus);
    }


    private MyPostDto convertToMyPostDto(Job item) {

        MyPostDto myPostDto = new MyPostDto();

        try {
            myPostDto = MyPostDto.builder()
                    .id(item.getId())
                    .name(item.getName())
                    .job(item.getJob())
                    .salary(item.getSalary())
                    .des(item.getDes())
                    .address(item.getAddress())
                    .cv(item.getCv())
                    .active(item.getActive())
                    .creationdate(item.getCreationDate())
                    .expdate(item.getExpDate())
                    .build();
        } catch (NumberFormatException | NullPointerException exception) {
            log.error(exception.getMessage());
        }

        return myPostDto;
    }

    public List<FreelancerStatsResponse> getRecommendedCandidates(FreelancerStatsRequest request) {

        // URL cụ thể của API Python
        String fullUrl =  "http://localhost:8000/recommend_candidates_for_job";
        restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<FreelancerStatsRequest> entity = new HttpEntity<>(request, headers);

        try {
            // Gọi API POST và map kết quả vào mảng PythonCandidateDTO
            FreelancerStatsResponse[] response = restTemplate.postForObject(
                    fullUrl,
                    entity,
                    FreelancerStatsResponse[].class
            );
            String raw = restTemplate.postForObject(fullUrl, entity, String.class);
            System.out.println("🔥 RAW RESPONSE = " + raw);


            // Kiểm tra và trả về kết quả
            if (response == null || response.length == 0) {
                return Collections.emptyList();
            }
            return Arrays.asList(response);

        } catch (HttpClientErrorException e) {
            // Xử lý lỗi 4xx (ví dụ: 404 Not Found, 400 Bad Request từ Python)
            String errorMessage = Objects.requireNonNullElse(e.getResponseBodyAsString(), e.getMessage());
            throw new RuntimeException("Lỗi từ Python Service (Client): " + errorMessage, e);
        } catch (HttpServerErrorException e) {
            // Xử lý lỗi 5xx (Internal Server Error từ Python)
            String errorMessage = Objects.requireNonNullElse(e.getResponseBodyAsString(), e.getMessage());
            throw new RuntimeException("Lỗi Server từ Python Service: " + errorMessage, e);
        } catch (Exception e) {
            // Lỗi kết nối, timeout, hoặc lỗi mapping JSON khác
            throw new RuntimeException("Lỗi kết nối hoặc xử lý response từ Python Service.", e);
        }
    }
}
