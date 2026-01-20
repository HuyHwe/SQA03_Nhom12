package com.resourceservice.controller;

import com.jober.utilsservice.constant.Constant;
import com.jober.utilsservice.model.PageableModel;
import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.dto.*;
import com.resourceservice.dto.request.FreelancerStatsRequest;
import com.resourceservice.dto.request.FreelancerStatsResponse;
import com.resourceservice.dto.request.ScheduleParamDTO;
import com.resourceservice.model.RecruiterManagement;
import com.resourceservice.service.FreelancerService;
import com.resourceservice.service.RecommendationService;
import com.resourceservice.service.RecruiterManagementService;
import com.resourceservice.service.RecruiterService;
import com.resourceservice.service.ScheduleService;
import com.resourceservice.service.impl.JobServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("bs-user/recruiter")
public class RecruiterController {
    @Autowired
    private RecruiterService recruiterService;
    @Autowired
    private ScheduleService scheduleService;
    @Autowired
    private FreelancerService freelancerService;
    @Autowired
    private JobServiceImpl jobService;
    @Autowired
    private RecruiterManagementService recruiterManagementService;
    private RecommendationService recommendationService;

    @PostMapping(value = "/_get_applied_candidate", produces = "application/json")
    public ResponseObject getAppliedCandidate(@RequestBody Paging paging) {
        ResponseEntity responseEntity = null;
        try {
            responseEntity = recruiterService.findAppliedCandidate(paging);
            return (ResponseObject) responseEntity.getBody();
        } catch (Exception e) {
            System.out.println(e);
        }
        return null;
    }
    @GetMapping(value = "/getOrganizationName")
    public ResponseEntity<ResponseObject> getOrganizationName() {
        ResponseEntity responseEntity = null;
        try {
            responseEntity = recruiterService.getOrganizationName();
            return responseEntity;
        } catch (Exception e) {
            System.out.println(e);
        }
        return null;
    }


    //add record to recruitermanagement
    @PostMapping(value = "/_create")
    public ResponseEntity<ResponseObject> createFeedback(@RequestBody RecruiterManagement recruiterManagement) {
        ResponseEntity responseEntity = recruiterService.addNewRecruiter(recruiterManagement);
        return responseEntity;
    }

    @PostMapping(value = "/posts")
    public ResponseEntity listPosts(@RequestBody PageableModel params) {
        return recruiterService.listPost(params);
    }

    @PostMapping(value = "/posts/csv")
    public void listPostsCSV(HttpServletResponse servletResponse, @RequestBody List<Long> params) throws IOException {
        servletResponse.setContentType("text/csv");
        servletResponse.setCharacterEncoding("UTF-16LE");
        servletResponse.addHeader("Content-Disposition", "attachment; charset=UTF-16LE; filename=\"posts.csv\"");
        recruiterService.listPostCSV(servletResponse.getWriter(), params);
    }

    //Ứng viên phù hợp
    @PostMapping(value = "/candidates")
    public ResponseEntity<ResponseObject> listCandidate(@RequestBody LocationParamsDto params) {
        return freelancerService.listCandidate(params);
    }

    //Ứng viên đã liên hệ
    @PostMapping(value = "/candidates/contacted")
    public ResponseEntity<ResponseObject> listCandidateContact(@RequestBody Paging Paging) {
        return freelancerService.getListFreelancerByUid(Paging);
    }

    //Ứng viên đã trúng tuyển
    @PostMapping(value = "/candidates/selected")
    public ResponseEntity<ResponseObject> listCandidateSelected(@RequestBody ScheduleParamDTO scheduleParamDTO) {
        return scheduleService.getScheduleByStatus(scheduleParamDTO);
    }

    //Ứng viên đã kí
    @PostMapping(value = "/candidates/signed")
    public ResponseEntity<ResponseObject> listCandidateSigned(@RequestBody LocationParamsDto params) {
        return freelancerService.listFreelancersByNote(Constant.SIGNED_NOTE, params);
    }

    //Ứng viên đã từ chối offer
    @PostMapping(value = "/candidates/refuse")
    public ResponseEntity<ResponseObject> listCandidateRefuse(@RequestBody LocationParamsDto params) {
        return freelancerService.listFreelancersByNote(Constant.REFUSE_NOTE, params);
    }

    //Ứng viên đã lưu
    @PostMapping(value = "/candidates/saved")
    public ResponseEntity<ResponseObject> listCandidateSave(@RequestBody LocationParamsDto params) {
        return freelancerService.listFreelancersByNote(Constant.SAVE_NOTE, params);
    }

    //New jd
    @RequestMapping(method = RequestMethod.POST, value = "/_save", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity createJob(@RequestBody JobDTO params) {
        return jobService.saveJob(params);
    }

    //export csv Ứng viên đã liên hệ
    @PostMapping(value = "/candidates/csv")
    public void listCandidateCsv(HttpServletResponse servletResponse,
                                 @RequestBody LocationParamsDto params) throws IOException {
        servletResponse.setContentType("text/csv");
        servletResponse.setCharacterEncoding("UTF-16LE");
        servletResponse.addHeader("Content-Disposition", "attachment; charset=UTF-16LE; filename=\"candidates.csv\"");
        freelancerService.listCandidatesCsv(servletResponse.getWriter(), params);
    }

    @PostMapping(value = "/rank")
    public ResponseEntity<ResponseObject> applyCount(@RequestBody UserCommonDTO userCommonDTO) {
        return jobService.listPeopleApply(userCommonDTO);
    }

    //List jd
    @PostMapping(value = "/jobs-by-user")
    public ResponseEntity<ResponseObject> listJD(@RequestBody JobDTO jobDTO) {
        return jobService.listJobByUser(jobDTO);
    }
    // create new job posting
    @PostMapping(value = "/_create_job")
    public ResponseEntity<ResponseObject> createJobPosting(@RequestBody JobDTO jobDTO) {
        return jobService.adminSaveJobPost(jobDTO);
    }

    //Add new contacted
    @PostMapping(value = "/candidates/contacted/new/{id}")
    public ResponseEntity<String> addContacted(@PathVariable("id") Long id, @RequestBody Map<String, Long> param) {

        Long freelancerId = param.get("freelancerId");
        return recruiterService.addNewCandidate(id, freelancerId, Constant.CONTACTED_NOTE);
    }

    //update status to selected
    @PostMapping(value = "/candidates/selected/new/{id}")
    public ResponseEntity<String> updateStatusSelected(@PathVariable("id") Long id, @RequestBody Map<String, Long> param) {

        Long freelancerId = param.get("freelancerId");
        return recruiterService.updateStatusCandidate(id, freelancerId, Constant.SELECTED_NOTE);
    }

    //update status to signed
    @PostMapping(value = "/candidates/signed/new/{id}")
    public ResponseEntity<String> updateStatusSigned(@PathVariable("id") Long id, @RequestBody Map<String, Long> param) {

        Long freelancerId = param.get("freelancerId");
        return recruiterService.updateStatusCandidate(id, freelancerId, Constant.SIGNED_NOTE);
    }

    //update status to refused
    @PostMapping(value = "/candidates/refused/new/{id}")
    public ResponseEntity<String> updateStatusRefused(@PathVariable("id") Long id, @RequestBody Map<String, Long> param) {

        Long freelancerId = param.get("freelancerId");
        return recruiterService.updateStatusCandidate(id, freelancerId, Constant.REFUSE_NOTE);
    }

    //add new save candidate
    @PostMapping(value = "/candidates/saved/new/{id}")
    public ResponseEntity<String> addSaved(@PathVariable("id") Long id, @RequestBody Map<String, Long> param) {

        Long freelancerId = param.get("freelancerId");
        return recruiterService.addNewCandidate(id, freelancerId, Constant.SAVE_NOTE);
    }

    //list ứng viên đã giới thiệu
    @PostMapping(value = "/candidates/find_by_user_id")
    public ResponseEntity<ResponseObject> listCandidateByUserId(@RequestBody PageableModel pageableModel) {
        ResponseEntity responseEntity = freelancerService.listFreelancerByUserId(pageableModel);
        return responseEntity;
    }

    //Sửa thông tin ứng viên
    @PatchMapping(value = "/candidates/edit")
    public ResponseEntity<ResponseObject> editFreelancer(@RequestBody FreelancerDTO freelancerDTO) {

        return freelancerService.updateFreelancer(freelancerDTO);
    }

    //Update active job
    @PutMapping(value = "/job/edit/{id}")
    public ResponseEntity<ResponseObject> editActiveJob(@PathVariable("id") Long jobId) {

        return jobService.updateActiveJob(jobId);
    }

    /**
     * update note = 0 -> contacted freelancer, note = 1 -> passed freelancer, note = 2 -> signed , note = 3 -> refused offer, note = 4 unsaved offer, note = 5 saved offer
     * @param recruiterManagementDTO
     * @return
     */
    @PostMapping(value = "/management/_save")
    public ResponseEntity<Response> saveRecruiterManagement(@RequestBody RecruiterManagementDTO recruiterManagementDTO) {
        return recruiterManagementService.saveRecruiterManagement(recruiterManagementDTO);
    }

    @PostMapping("/stats/by-jobdefault")
    public ResponseEntity<List<FreelancerStatsResponse>> getFreelancerStatsByJobDefault(@RequestBody FreelancerStatsRequest request) {
        return ResponseEntity.ok(recruiterService.getRecommendedCandidates(request));
    }
}
