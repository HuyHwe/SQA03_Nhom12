package com.resourceservice.feign;

import com.resourceservice.dto.CandidateDto;
import com.resourceservice.dto.JobDTO;
import com.resourceservice.dto.request.RecommendationJobRequest;
import com.resourceservice.dto.request.RecommendedCandidate;
import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "recommendation-service", url = "${feign.recommendation-service.url}")
public interface RecommendationFeignClient {

  @PostMapping("/recommend_by_user")
  List<JobDTO> getJobRecommendByUser(@RequestBody RecommendationJobRequest request);

  @PostMapping("/recommend_candidates_for_job")
  List<CandidateDto> getCandidateRecommendByJob(@RequestBody RecommendedCandidate request);

}
