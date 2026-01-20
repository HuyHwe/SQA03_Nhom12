package com.resourceservice.dto.response;

import com.resourceservice.dto.JobDetailDto;
import com.resourceservice.model.Organization;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrganizationDetailResponse {
    private Organization organization;
    private Page<JobDetailDto> jobs;
}
