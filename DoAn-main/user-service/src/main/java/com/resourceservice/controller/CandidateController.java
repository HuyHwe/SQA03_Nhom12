package com.resourceservice.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.jober.utilsservice.model.PageableModel;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.dto.CandidateManagementDTO;
import com.resourceservice.dto.FreelancerDTO;
import com.resourceservice.dto.LocationParamsDto;
import com.resourceservice.model.Freelancer;
import com.resourceservice.service.CandidateManagementService;
import com.resourceservice.service.FreelancerService;
import com.resourceservice.service.impl.CandidateManagementImpl;
import com.resourceservice.service.impl.JobServiceImpl;
import com.resourceservice.utilsmodule.utils.modelCustom.Paging;
import com.resourceservice.utilsmodule.utils.modelCustom.SearchInputCommon;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("bs-user/candidate")
public class CandidateController {
    @Autowired
    JobServiceImpl jobService;
    @Autowired
    FreelancerService freelancerService;
    @Autowired
    private CandidateManagementService candidateManagementService;
    @Autowired
    private CandidateManagementImpl candidateManagement;

    //List job suitable
    @PostMapping(value = "/jobs")
    public ResponseEntity<ResponseObject> listJobs(@RequestBody LocationParamsDto params) {
        return jobService.listJobs(params);
    }

    //List job apply
    @PostMapping(value = "/saved_jobs")
    public ResponseEntity<ResponseObject> listSavedJobs(@RequestBody LocationParamsDto param) {
        return jobService.listSavedJobs(param);
    }

    //List job interview
    @PostMapping(value = "/jobs/interview")
    public ResponseEntity<ResponseObject> listJobsInterview(@RequestBody LocationParamsDto params) {
        return jobService.listJobsByNote("1", params);
    }

    //List save job
    @PostMapping(value = "/jobs/save")
    public ResponseEntity<ResponseObject> listJobsSave(@RequestBody LocationParamsDto params) {
        return jobService.listJobsByNote("5", params);
    }

    //CSV job
    @PostMapping(value = "/jobs/csv")
    public void listJobsCsv(HttpServletResponse servletResponse,
                            @RequestBody LocationParamsDto params) throws IOException {
        servletResponse.setContentType("text/csv");
        servletResponse.setCharacterEncoding("UTF-16LE");
        servletResponse.addHeader("Content-Disposition", "attachment; charset=UTF-16LE; filename=\"jobs.csv\"");
        jobService.listJobsCsv(servletResponse.getWriter(), params);
    }

    //Đăng tìm việc của tôi || Giới thiệu ứng viên
    //todo input file
    @PostMapping(value = "/cv")
    public ResponseEntity findJob(@RequestBody FreelancerDTO params) {
        return new ResponseEntity<Freelancer>(freelancerService.newFindJob(params), HttpStatus.OK);
    }

    /**
     * update note = 0 -> contacted freelancer, note = 1 -> passed freelancer, note = 2 -> signed , note = 3 -> refused offer, note = 4 unsaved offer, note = 5 saved offer
     * @param candidateManagementDTO
     * @return
     */
    @PostMapping(value = "/_update_note")
    public ResponseEntity<Response> updateRecruiterManagement(@RequestBody CandidateManagementDTO candidateManagementDTO) {
        return candidateManagementService.updateCandidateManagement(candidateManagementDTO);
    }
    @PostMapping(value = "candidate_management/_save")
    public ResponseEntity<ResponseObject> createCandidateManagement(@RequestBody CandidateManagementDTO candidateManagementDTO ){
        return candidateManagement.saveCandidate(candidateManagementDTO);
    }

    @PostMapping(value = "candidate_management/_jobs_of_candidate")
    public ResponseEntity<ResponseObject> getJobsOfCandidate(@RequestBody Paging paging){
        return candidateManagement.getJobsOfCandidate(paging);
    }
    @PostMapping(value = "candidate_management/get_job_by_id")
    public ResponseEntity<ResponseObject> getJobById(@RequestBody Long jobId) throws JsonProcessingException {
        return candidateManagement.getJobById(jobId);
    }
    @PostMapping(value = "candidate_management/_delete")
    public ResponseEntity<Response> updateCandidateManagement(@RequestBody List<Long> candidateManagementIds ){
        System.out.println(candidateManagementIds.size());
        return candidateManagement.deleteCandidateManagement(candidateManagementIds);
    }
}
