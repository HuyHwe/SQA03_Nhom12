package com.resourceservice.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class ChartDataDTO {
    private List<JobPostingData> jobPostingsThisWeek;
    private List<SalaryByIndustryData> salaryByIndustryToday;
    private Long totalJobs24h;
    private Long totalActiveJobs;
    private Long totalCompanies;
}

