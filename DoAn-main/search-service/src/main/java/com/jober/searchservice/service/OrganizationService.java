package com.jober.searchservice.service;

import com.jober.searchservice.dto.RecruiterCompany;
import com.jober.searchservice.dto.PageResponse;
import com.jober.searchservice.model.Organization;
import com.jober.utilsservice.dto.OrgInputDTO;
import com.jober.utilsservice.dto.OrgSearchingDTO;
import com.jober.utilsservice.errors.ResponseEntitySerializable;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;

public interface OrganizationService {
    Organization getOrgByUserId(Long id);
    Organization aminGetOrgByUserId(Long id);
    ResponseEntitySerializable<ResponseObject> getOrg(OrgSearchingDTO orgSearchingDTO);
    ResponseObject save(OrgInputDTO orgInputDTO);
    PageResponse<RecruiterCompany> getAllRecruiterByOrganization(Integer size, Integer offset, String organizationName);
    void updateRecruiterStatus(Long recruiterId, String status);
}
