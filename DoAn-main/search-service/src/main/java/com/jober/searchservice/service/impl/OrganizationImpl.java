package com.jober.searchservice.service.impl;

import com.jober.searchservice.dto.RecruiterCompany;
import com.jober.searchservice.dto.PageResponse;
import com.jober.searchservice.model.Organization;
import com.jober.searchservice.model.RecruiterConfiguration;
import com.jober.searchservice.repository.OrganizationRepo;
import com.jober.searchservice.repository.RecruiterConfigurationRepository;
import com.jober.searchservice.service.OrganizationService;
import com.jober.searchservice.utilsmodule.RecruiterStatus;
import com.jober.utilsservice.constant.ResponseMessageConstant;
import com.jober.utilsservice.dto.OrgInputDTO;
import com.jober.utilsservice.dto.OrgSearchingDTO;
import com.jober.utilsservice.errors.ResponseEntitySerializable;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static com.jober.utilsservice.constant.Constant.ACTIVE;
import static com.jober.utilsservice.constant.Constant.SUCCESS_CODE;
import static com.jober.utilsservice.constant.ResponseMessageConstant.*;

@Service
public class OrganizationImpl implements OrganizationService {

  @Autowired
  private OrganizationRepo organizationRepo;

  @Autowired
  private RecruiterConfigurationRepository recruiterConfigurationRepository;

  @Override
  public Organization getOrgByUserId(Long id) {
    Optional<Organization> optional = organizationRepo.findById(id);
    Organization organization = optional.orElseThrow(
        () -> new IllegalArgumentException(ResponseMessageConstant.NOT_FOUND));
    return organization;
  }

  @Override
  public Organization aminGetOrgByUserId(Long id) {
    Optional<Organization> optional = organizationRepo.findById(id);
    Organization organization = optional.orElseThrow(
        () -> new IllegalArgumentException(ResponseMessageConstant.NOT_FOUND));
    return organization;
  }


  @Override
  public ResponseEntitySerializable<ResponseObject> getOrg(OrgSearchingDTO orgSearchingDTO) {
    int page = orgSearchingDTO.getPaging().getPage();
    int size = orgSearchingDTO.getPaging().getSize();
    Pageable pageable = PageRequest.of(page - 1, size);
    ResponseObject responseObject = null;
    HttpStatus httpStatus = null;
    if (orgSearchingDTO.getId() != null) {
      Optional optional = organizationRepo.findById(orgSearchingDTO.getId());
      responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
          1L,
          1, 1, Arrays.asList(optional.get()));
      httpStatus = HttpStatus.OK;
      return new ResponseEntitySerializable(responseObject, httpStatus);
    } else if (orgSearchingDTO.getName() != null && !orgSearchingDTO.getName().toString()
        .isEmpty()) {
      Page<Organization> organizationPage = organizationRepo.findByName(
          orgSearchingDTO.getName().toString().toLowerCase(), pageable);
      List<Organization> organizations = organizationPage.getContent();
      responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
          organizationPage.getTotalElements(),
          organizations.size(), organizationPage.getTotalPages(), organizations);
      httpStatus = HttpStatus.OK;
      return new ResponseEntitySerializable(responseObject, httpStatus);
    } else {
      Page<Organization> organizationPage = organizationRepo.findAll(pageable);
      List<Organization> organizations = organizationPage.getContent();
      responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
          organizationPage.getTotalElements(),
          organizations.size(), organizationPage.getTotalPages(), organizations);
      httpStatus = HttpStatus.OK;
      return new ResponseEntitySerializable(responseObject, httpStatus);
    }
  }

  @Override
  public ResponseObject save(OrgInputDTO orgInputDTO) {
    Organization organization = organizationRepo.findByName(orgInputDTO.getName());
    ResponseObject responseObject = null;
    if (organization != null) {
      responseObject = new ResponseObject(FOUND, EXISTED, organization);
      return responseObject;
    }
    organization = Organization.builder().
        name(orgInputDTO.getName()).
        description(orgInputDTO.getDes()).
        updateDate(LocalDateTime.now()).
        build();
    if (orgInputDTO.getId() == null) {
      organization.setActive(ACTIVE);
      organization.setCreationDate(LocalDateTime.now());
    }
    organization = (Organization) organizationRepo.save(organization);
    responseObject = new ResponseObject(SUCCESS, SUCCESS_CODE, organization);
    return responseObject;
  }

  @Override
  public PageResponse<RecruiterCompany> getAllRecruiterByOrganization(Integer size, Integer offset,
      String organizationName) {
    List<RecruiterCompany> recruiterCompanies = organizationRepo.getAllRecruiter(organizationName);

    int totalElements = recruiterCompanies.size();

    int pageSize = (size != null && size > 0) ? size : 10;

    int pageIndex = (offset != null && offset >= 0) ? offset : 0;

    int fromIndex = pageIndex * pageSize;

    int toIndex = Math.min(fromIndex + pageSize, totalElements);

    List<RecruiterCompany> paginatedList = Collections.emptyList();

    if (fromIndex < totalElements) {
      paginatedList = recruiterCompanies.subList(fromIndex, toIndex);
    }

    int totalPages = (int) Math.ceil((double) totalElements / pageSize);

    return PageResponse.<RecruiterCompany>builder()
        .totalElement(totalElements)
        .totalPage(totalPages)
        .pageIndex(pageIndex)
        .pageSize(pageSize)
        .data(paginatedList)
        .build();

  }

  @Override
  public void updateRecruiterStatus(Long recruiterId, String status) {
    RecruiterStatus recruiterStatus = RecruiterStatus.valueOf(status);

    RecruiterConfiguration recruiterConfiguration = recruiterConfigurationRepository.findById(recruiterId).orElse(null);

    if (recruiterConfiguration != null) {
      recruiterConfiguration.setStatus(recruiterStatus);
      recruiterConfigurationRepository.save(recruiterConfiguration);
    }
  }
}
