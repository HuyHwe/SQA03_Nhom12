package com.resourceservice.dto.request;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class JobParamSearchDTO {
    private String searchKey;
    private String minSalary;
    private String maxSalary;
    private Long jobDefaultId;
    private Integer workingType;
    private Integer requiredExperienceLevel;
    private String province;
    private Integer page;
    private Integer size;

    public String getSearchKey() {
        return searchKey;
    }

    public void setSearchKey(String searchKey) {
        this.searchKey = searchKey;
    }

    public String getMinSalary() {
        return minSalary;
    }

    public void setMinSalary(String minSalary) {
        this.minSalary = minSalary;
    }

    public String getMaxSalary() {
        return maxSalary;
    }

    public void setMaxSalary(String maxSalary) {
        this.maxSalary = maxSalary;
    }

    public Long getJobDefaultId() {
        return jobDefaultId;
    }

    public void setJobDefaultId(Long jobDefaultId) {
        this.jobDefaultId = jobDefaultId;
    }

    public Integer getWorkingType() {
        return workingType;
    }

    public void setWorkingType(Integer workingType) {
        this.workingType = workingType;
    }

    public Integer getRequiredExperienceLevel() {
        return requiredExperienceLevel;
    }

    public void setRequiredExperienceLevel(Integer requiredExperienceLevel) {
        this.requiredExperienceLevel = requiredExperienceLevel;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }
}
