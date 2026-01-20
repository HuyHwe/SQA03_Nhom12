package com.resourceservice.service;

import com.jober.utilsservice.model.PageableModel;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.jober.utilsservice.utils.modelCustom.SearchInput;
import com.resourceservice.dto.*;
import com.resourceservice.dto.request.ChartDataDTO;
import com.resourceservice.dto.request.JobParamDTO;
import com.resourceservice.dto.request.JobParamSearchDTO;
import com.resourceservice.dto.request.UserParamDTO1;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.io.Writer;
import java.security.InvalidKeyException;
import java.util.List;

public interface JobService {

    ResponseEntity listJobsCompleted(UserParamDTO1 params);
    ResponseEntity applyJob(Long userId, Long jobDefaultId);
    ResponseEntity getListJobs(JobParamDTO jobParamDTO);

    ResponseEntity<ResponseObject> getListJobsV2(Long userId, int page, int pageSize);

    ResponseEntity latestJobs(LocationParamsDto params);
    ResponseEntity listJobs(LocationParamsDto params);

    ResponseEntity listSavedJobs(LocationParamsDto params);

    ResponseEntity listJobsByNote(String note, LocationParamsDto params);

    ResponseEntity<ResponseObject> saveJob(JobDTO job);
    ResponseEntity<ResponseObject> adminSaveJobPost(JobDTO job);
    void listJobsCsv(Writer writer, LocationParamsDto params);

    void jobsToCsv(Writer writer, List<JobDataModel> list);
    ResponseEntity getListJobs(SearchInput searchInput);

    ResponseEntity listPeopleApply(UserCommonDTO userCommonDTO) throws InvalidKeyException, IOException;

    ResponseEntity listJobByUser(JobDTO jobDTO);
    ResponseEntity deleteJobByIds(List<Long> ids);

    ResponseEntity updateActiveJob(Long jobId);
    ResponseEntity getJobsNearBy(LocationParamsDto params);
    ResponseEntity findById(Long id);
    Long findJobIdByJobDefaultIdAndUserId(Long jobDefaultId);
    ResponseEntity<Response> deleteJobs(List<Long> ids);
    ResponseEntity<Response> jobsHadPostByRecruiter();
    ChartDataDTO getChartData();
    ResponseEntity<ResponseObject> searchJobsAdvanced(JobParamSearchDTO searchDTO);
    ResponseEntity<ResponseObject> getJobsByOrganization(String organizationId, String jobId, int page, int size);
}
