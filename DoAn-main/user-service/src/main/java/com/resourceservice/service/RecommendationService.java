package com.resourceservice.service;

import com.resourceservice.dto.JobDTO;
import com.resourceservice.dto.JobRecommendationResult;
import java.util.List;
import java.util.Map;

public interface RecommendationService {

  List<JobDTO> getJobRecommendByUser(Long userId, Integer topK);

  List<JobRecommendationResult> getCandidateRecommendByJob();

  Map<String, List<JobDTO>> checkAndGetJobs();
}
