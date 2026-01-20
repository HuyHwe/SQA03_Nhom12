package com.resourceservice.dto.request;


import lombok.Data;

@Data
public class SalaryByIndustryData {
    private String salaryRange;
    private Long count;
}
