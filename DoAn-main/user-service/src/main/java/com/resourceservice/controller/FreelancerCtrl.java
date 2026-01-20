package com.resourceservice.controller;

import com.jober.utilsservice.utils.modelCustom.Paging;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.dto.request.*;
import com.resourceservice.dto.response.OrganizationDetailResponse;
import com.resourceservice.interceptor.BearerTokenWrapper;
import com.resourceservice.service.FreelancerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("bs-user/freelancer")
public class FreelancerCtrl {
    @Autowired
    FreelancerService freelancerService;

    private BearerTokenWrapper tokenWrapper;

    public FreelancerCtrl(BearerTokenWrapper tokenWrapper) {
        this.tokenWrapper = tokenWrapper;
    }

    @PostMapping(value = "/_search")
    public ResponseEntity<ResponseObject> listCandidate(@RequestBody JobParamDTO jobParamDTO) {
        return freelancerService.getListFreelancer(jobParamDTO);
    }
    @PostMapping("/_search/{userId}")
    public ResponseEntity<ResponseObject> searchFreelancers(
            @PathVariable Long userId,
            @RequestBody JobParamDTO jobParamDTO) {

        return freelancerService.getListFreelancerByUserId(userId, jobParamDTO);
    }

    @PostMapping(value = "/_create")
    public ResponseEntity<ResponseObject> createFreelancer(@RequestBody FreelancerCreateDTO freelancerCreateDTO) {
        return freelancerService.createFreelancer(freelancerCreateDTO);
    }
    @PostMapping(value = "/_createv2")
    public ResponseEntity<ResponseObject> createFreelancer(@RequestBody FreelancerCreateFullDTO freelancerCreateDTO) {
        return freelancerService.createFreelancerV2(freelancerCreateDTO);
    }

    @PostMapping(value = "/_get_by_user_and_job_default")
    public ResponseEntity<ResponseObject> getFreelancerByUserIdAndJobDefaultId(@RequestParam Long jobDefaultId) {
        return freelancerService.getFreelancerByUserIdAndJobDefaultId(jobDefaultId);
    }
    @GetMapping(value = "/_get_by_id")
    public ResponseEntity<ResponseObject> getCandidateInfo(@RequestParam Long freelancerId, @RequestParam(value = "jobId", required=false) Long jobId) {
        return freelancerService.getCandidateInfo(freelancerId, jobId);
    }
    @PostMapping(value = "/_posts")
    public ResponseEntity<ResponseObject> getCandidatePosts(@RequestBody Paging paging) {
        return freelancerService.getCandidatePosts(paging);
    }
    @PostMapping(value = "/_delete")
    public ResponseEntity<Response> deletePost(@RequestBody List<Long> ids) {
        ResponseEntity responseEntity = freelancerService.deleteByIds(ids);
        return responseEntity;
    }

    @RequestMapping(method = RequestMethod.GET , value = "/list_posted")
    public ResponseEntity<ResponseObject> getListJobHadPostByCandidate() {
        return freelancerService.jobsHadPostByCandidate();
    }
        @PostMapping("/recommend-candidates")
    public Object getRecommendedCandidates(@RequestBody getRecommendDTO getRecommendDTO) {
        Long recruiterId = Long.parseLong(getRecommendDTO.getUserId().trim());
        int page = getRecommendDTO.getPaging() != null ? getRecommendDTO.getPaging().getPage() : 0;
        int size = getRecommendDTO.getPaging() != null ? getRecommendDTO.getPaging().getSize() : 10;

        return freelancerService.recommendCandidatesForRecruiter(recruiterId, page, size);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/get_jobs_by_organization")
    public OrganizationDetailResponse getJobByOrganization(@RequestBody GetJobDTO req) {

        Long organizationId = req.getOrganizationId();
        Integer page = req.getPaging() != null ? req.getPaging().getPage() : 0;
        Integer size = req.getPaging() != null ? req.getPaging().getSize() : 10;

        return freelancerService.getOrganizationDetail(organizationId, page, size);
    }

}
