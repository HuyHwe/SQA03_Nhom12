package com.jober.searchservice.controller;

import com.jober.searchservice.model.Organization;
import com.jober.searchservice.service.OrganizationService;
import com.jober.utilsservice.dto.OrgInputDTO;
import com.jober.utilsservice.dto.OrgSearchingDTO;
import com.jober.utilsservice.errors.ResponseEntitySerializable;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("bs-search/organization")
public class OrganizationCtrl {

  @Autowired
  private OrganizationService organizationService;

  @GetMapping(value = "/_find_by_id")
  public Organization getOrgByUserId(@RequestParam Long id) {
    return organizationService.getOrgByUserId(id);
  }

  @PostMapping(value = "/_search")
  public ResponseEntitySerializable<ResponseObject> getOrg(
      @RequestBody OrgSearchingDTO orgSearchingDTO) {
    return organizationService.getOrg(orgSearchingDTO);
  }

  @PostMapping(value = "/_save")
  public ResponseObject save(@RequestBody OrgInputDTO orgInputDTO) {
    return organizationService.save(orgInputDTO);
  }

  @GetMapping("/_get_all_recruiter")
  public ResponseEntity<?> getAllRecruiter(
      @RequestParam(required = false, defaultValue = "10") Integer size,
      @RequestParam(required = false, defaultValue = "0") Integer offset,
      @RequestParam(required = false, defaultValue = "") String organizationName) {
    return ResponseEntity.ok(
        organizationService.getAllRecruiterByOrganization(size, offset, organizationName));
  }

  @PostMapping("/_update_recruiter_status")
  public ResponseEntity<?> updateRecruiterStatus(@RequestParam("recruiterId") Long recruiterId,
                                                 @RequestParam("status") String status) {

    organizationService.updateRecruiterStatus(recruiterId, status);
    return ResponseEntity.ok("Updated recruiter status successfully");
  }
}
