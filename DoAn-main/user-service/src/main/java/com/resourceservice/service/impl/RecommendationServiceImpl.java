package com.resourceservice.service.impl;

import com.amazonaws.services.mq.model.BadRequestException;
import com.resourceservice.dto.CandidateDto;
import com.resourceservice.dto.JobDTO;
import com.resourceservice.dto.JobRecommendationResult;
import com.resourceservice.dto.RecruiterJob;
import com.resourceservice.dto.request.RecommendationJobRequest;
import com.resourceservice.dto.request.RecommendedCandidate;
import com.resourceservice.feign.RecommendationFeignClient;
import com.resourceservice.repository.UserCommonRepo;
import com.resourceservice.service.RecommendationService;
import com.resourceservice.service.UserCommonService;
import feign.FeignException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

  private final UserCommonService userService;

  private final RecommendationFeignClient recommendationFeignClient;

  private final UserCommonRepo userCommonRepo;

  private LocalDate now = LocalDate.now();

  @Override
  public List<JobDTO> getJobRecommendByUser(Long userId, Integer topK) {
    return null;
  }

  @Override
  public List<JobRecommendationResult> getCandidateRecommendByJob() {
    List<RecruiterJob> recruiterJobs = userCommonRepo.getRecruiterJobs();

    List<JobRecommendationResult> results = new ArrayList<>();

    for (RecruiterJob job : recruiterJobs) {

      Long currentRecruiterId = job.getRecruiterId();
      Long currentJobId = job.getJobId();
      String currentEmail = job.getEmail();
      String currentTitle = job.getTitle();

      try {
        RecommendedCandidate request = RecommendedCandidate.builder()
            .recruiterId(currentRecruiterId)
            .jobId(currentJobId)
            .topK(20)
            .build();

        // List<CandidateDto> candidates =
        // recommendationFeignClient.getCandidateRecommendByJob(request);
        List<CandidateDto> candidates = null; // Tạm thời ngắt gọi service recommendation

        if (candidates != null && !candidates.isEmpty()) {
          JobRecommendationResult resultItem = JobRecommendationResult.builder()
              .recruiterEmail(currentEmail)
              .jobId(currentJobId)
              .jobTitle(currentTitle)
              .candidates(candidates)
              .build();

          results.add(resultItem);
        }

      } catch (Exception e) {
        return null;
      }
    }

    return results;
  }

  @Override
  public Map<String, List<JobDTO>> checkAndGetJobs() {
    Map<Long, String> userEmails = userService.getUserEmail();

    Set<Long> userIds = userEmails.keySet();

    Map<String, List<JobDTO>> result = new HashMap<>();

    userIds.forEach(userId -> {
      List<JobDTO> jobs = null;

      RecommendationJobRequest request = RecommendationJobRequest.builder()
          .user_id(userId)
          .top_k(20)
          .build();

      try {
        // jobs = recommendationFeignClient.getJobRecommendByUser(request);
        jobs = new ArrayList<>(); // Tạm thời ngắt gọi service recommendation
      } catch (Exception ex) {
        return;
      }

      if (jobs == null || jobs.isEmpty()) {
        return;
      }

      List<JobDTO> nearDeadlineJobs = jobs.stream().filter(
          job -> job.getExpDate() != null && !job.getExpDate().toLocalDate().isBefore(now)
              && job.getExpDate().toLocalDate().isBefore(now.plusDays(2)))
          .collect(Collectors.toList());

      if (nearDeadlineJobs.isEmpty()) {
        return;
      }

      String email = userEmails.get(userId);

      result.put(email, nearDeadlineJobs);
    });

    return result;
  }
}
