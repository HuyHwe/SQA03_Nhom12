package com.resourceservice.controller;

import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.dto.JobDTO;
import com.resourceservice.dto.LocationParamsDto;
import com.resourceservice.dto.request.ChartDataDTO;
import com.resourceservice.dto.request.JobApplyInput;
import com.resourceservice.dto.request.JobParamDTO;
import com.resourceservice.dto.request.JobParamSearchDTO;
import com.resourceservice.dto.request.UserParamDTO1;
import com.resourceservice.dto.request.getRecommendDTO;
import com.resourceservice.service.JobService;
import com.resourceservice.service.RecommendationService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("bs-user/bs-job")
public class JobCtrl {

  @Autowired
  private JobService jobService;

  @Autowired
  private RecommendationService recommendationService;

  @RequestMapping(method = RequestMethod.POST, value = "/_search")
  public ResponseEntity<ResponseObject> getListJobsCommon(@RequestBody JobParamDTO jobParamDTO) {
    return jobService.getListJobs(jobParamDTO);
  }

  @RequestMapping(method = RequestMethod.POST, value = "/_search_v2")
  public ResponseEntity<ResponseObject> getListJobsCommon(
      @RequestBody getRecommendDTO getRecommendDTO) {
    Long userId = Long.parseLong(getRecommendDTO.getUserId().trim());
    int page = getRecommendDTO.getPaging() != null ? getRecommendDTO.getPaging().getPage()
        : 0; // Mặc định page = 0
    int size = getRecommendDTO.getPaging() != null ? getRecommendDTO.getPaging().getSize()
        : 10; // Mặc định size = 10
    return jobService.getListJobsV2(userId, page, size);
  }

  @RequestMapping(method = RequestMethod.POST, value = "/_search_advanced")
  public ResponseEntity<ResponseObject> searchJobsAdvanced(
      @RequestBody JobParamSearchDTO searchDTO) {
    return jobService.searchJobsAdvanced(searchDTO);
  }

  @RequestMapping(method = RequestMethod.POST, value = "/_apply_job")
  public ResponseEntity<ResponseObject> applyJob(@RequestBody JobApplyInput jobApplyInput) {
    return jobService.applyJob(jobApplyInput.getUserId(), jobApplyInput.getJobDefaultId());
  }

  @RequestMapping(method = RequestMethod.POST, value = "/_search_jobs_near_by")
  public ResponseEntity<ResponseObject> getJobsNearBy(@RequestBody LocationParamsDto params) {
    return jobService.getJobsNearBy(params);
  }

  @RequestMapping(method = RequestMethod.POST, value = "/_job_completed")
  public ResponseEntity<ResponseObject> getJobsNearBy(@RequestBody UserParamDTO1 param) {
    return jobService.listJobsCompleted(param);
  }

  @RequestMapping(method = RequestMethod.POST, value = "/_latest_jobs")
  public ResponseEntity<ResponseObject> getLatestJobs(@RequestBody LocationParamsDto params) {
    return jobService.latestJobs(params);
  }

  @RequestMapping(method = RequestMethod.POST, value = "/_save", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity createJob(@RequestBody JobDTO params) {
    return jobService.saveJob(params);
  }

  @RequestMapping(method = RequestMethod.GET, value = "/_get_by_id", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity findById(@RequestParam("id") Long id) {
    return jobService.findById(id);
  }

  /**
   *
   * @param jobDefaultId
   * @return
   */
  @RequestMapping(method = RequestMethod.GET, value = "/_get_by_jobdefault_id", produces = MediaType.APPLICATION_JSON_VALUE)
  public Long findByJobDefaultId(@RequestParam("jobDefaultId") Long jobDefaultId) {
    return jobService.findJobIdByJobDefaultIdAndUserId(jobDefaultId);
  }

  @RequestMapping(method = RequestMethod.POST, value = "/_delete")
  public ResponseEntity<Response> getListJobsCommon(@RequestBody List<Long> ids) {
    return jobService.deleteJobs(ids);
  }

  @GetMapping("/getChartData")
  public ResponseEntity<ChartDataDTO> getChartData() {
    ChartDataDTO chartData = jobService.getChartData();
    return ResponseEntity.ok(chartData);
  }

  @RequestMapping(method = RequestMethod.GET, value = "/list_posted")
  public ResponseEntity<Response> getListJobHadPostByRecruiter() {
    return jobService.jobsHadPostByRecruiter();
  }

  @GetMapping("/test")
  public ResponseEntity<?> test() {
    return ResponseEntity.ok().body(recommendationService.getCandidateRecommendByJob());
  }
}
