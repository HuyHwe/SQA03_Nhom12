package com.resourceservice.controller;

import com.amazonaws.services.dynamodbv2.document.Page;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.dto.JobDetailDto;
import com.resourceservice.dto.request.JobFilterDto;
import com.resourceservice.dto.request.OrganizationRequest;
import com.resourceservice.model.Organization;
import com.resourceservice.model.UserCommon;
import com.resourceservice.repository.OrganizationRepository;
import com.resourceservice.repository.UserCommonRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityNotFoundException;
import javax.validation.Valid;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.jober.utilsservice.constant.ResponseMessageConstant.*;
import static com.resourceservice.utilsmodule.constant.Constant.SUCCESS_CODE;

@RestController
@RequestMapping("bs-user/organization")
public class OrganizationController {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserCommonRepo userCommonRepository;

    @Autowired
    private com.resourceservice.service.JobService jobService;

    @PostMapping
    public ResponseEntity<Organization> createOrganization(@RequestBody OrganizationRequest request) {
        Organization organization = Organization.builder()
                .name(request.getName())
                .description(request.getDes())
                .creationDate(LocalDateTime.now())
                .updateDate(LocalDateTime.now())
                .active(1)
                .avatar(request.getAvatar() != null ? request.getAvatar() : "")
                .build();

        Organization savedOrganization = organizationRepository.save(organization);

        if (request.getUserId() != null) {
            Optional<UserCommon> userOptional = userCommonRepository.findById(request.getUserId());
            if (userOptional.isPresent()) {
                UserCommon user = userOptional.get();
                user.setOrganizationId(savedOrganization.getId());
                user.setUpdateDate(java.time.LocalDateTime.now());
                userCommonRepository.save(user);
            } else {
                throw new EntityNotFoundException("User with ID " + request.getUserId() + " not found");
            }
        }

        return new ResponseEntity<>(savedOrganization, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Organization>> getAllOrganizations() {
        List<Organization> organizations = organizationRepository.findAll();
        return new ResponseEntity<>(organizations, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Organization> getOrganizationById(@PathVariable Long id) {
        Optional<Organization> organization = organizationRepository.findById(id);
        return organization.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    @GetMapping("/user/{userId}")
    public ResponseEntity<Organization> getOrganizationByUserId(@PathVariable Long userId) {
        Optional<UserCommon> userOptional = userCommonRepository.findById(userId);
        if (userOptional.isPresent()) {
            UserCommon user = userOptional.get();
            Long organizationId = user.getOrganizationId();
            if (organizationId != null) {
                Optional<Organization> organization = organizationRepository.findById(organizationId);
                return organization.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                        .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/{id}")
    public ResponseEntity<Organization> updateOrganization(@PathVariable Long id, @RequestBody OrganizationRequest request) {
        Optional<Organization> existingOrganization = organizationRepository.findById(id);
        if (existingOrganization.isPresent()) {
            Organization organization = existingOrganization.get();
            organization.setName(request.getName());
            organization.setDescription(request.getDes());
            organization.setUpdateDate(LocalDateTime.now());
            organization.setActive(request.getActive() != null ? request.getActive() : organization.getActive());
            organization.setAvatar(request.getAvatar() != null ? request.getAvatar() : organization.getAvatar());

            Organization updatedOrganization = organizationRepository.save(organization);
            return new ResponseEntity<>(updatedOrganization, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // Delete organization
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrganization(@PathVariable Long id) {
        Optional<Organization> organization = organizationRepository.findById(id);
        if (organization.isPresent()) {
            // Set active to 0 instead of physical deletion
            Organization org = organization.get();
            org.setActive(0);
            org.setUpdateDate(LocalDateTime.now());
            organizationRepository.save(org);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }


    @PostMapping("/by-organization")
    public ResponseEntity<ResponseObject> getJobsByOrganization(@Valid @RequestBody JobFilterDto requestDto) {
        if (requestDto == null) {
            throw new IllegalArgumentException("JobFilterDto cannot be null");
        }

        int page = requestDto.getPaging() != null && requestDto.getPaging().getPage() > 0
                ? requestDto.getPaging().getPage()
                : 1;

        int size = requestDto.getPaging() != null && requestDto.getPaging().getSize() > 0
                ? requestDto.getPaging().getSize()
                : 10;
        return jobService.getJobsByOrganization(
                requestDto.getOrganizationId(),
                requestDto.getJobId(),
                page,
                size
        );
    }
}
