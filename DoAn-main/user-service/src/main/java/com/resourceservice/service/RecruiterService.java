package com.resourceservice.service;

import com.jober.utilsservice.model.PageableModel;
import com.jober.utilsservice.utils.modelCustom.Paging;
import com.resourceservice.dto.request.FreelancerStatsRequest;
import com.resourceservice.dto.request.FreelancerStatsResponse;
import com.resourceservice.model.RecruiterManagement;
import org.springframework.http.ResponseEntity;

import java.io.Writer;
import java.util.List;

public interface RecruiterService {

    ResponseEntity addNewRecruiter(RecruiterManagement recruiterManagement);

    ResponseEntity addNewCandidate(Long userId, Long freelancerId, String note);

    ResponseEntity updateStatusCandidate(Long userId, Long freelancerId, String note);

    ResponseEntity listPost(PageableModel pageableModel);

    void listPostCSV(Writer writer, List<Long> listJobId);

    ResponseEntity updateNoteRecruiterManagement(Long userId, Long freelancerId, String note);

    ResponseEntity findAppliedCandidate(Paging paging);
    ResponseEntity getOrganizationName();

    List<FreelancerStatsResponse> getRecommendedCandidates(FreelancerStatsRequest request);
}
