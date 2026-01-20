package com.resourceservice.service.impl;

import com.jober.utilsservice.dto.WalletDTO;
import com.jober.utilsservice.utils.Utility;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.dto.FreelancerDTO;
import com.resourceservice.dto.RecruiterManagementDTO;
import com.resourceservice.interceptor.BearerTokenWrapper;
import com.resourceservice.model.Freelancer;
import com.resourceservice.model.RecruiterManagement;
import com.resourceservice.model.UserCommon;
import com.resourceservice.repository.RecruiterManagementRepo;
import com.resourceservice.repository.UserCommonRepo;
import com.resourceservice.service.RecruiterManagementService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static com.jober.utilsservice.constant.Constant.*;
import static com.jober.utilsservice.constant.Constant.NOT_MODIFIED;
import static com.jober.utilsservice.constant.ResponseMessageConstant.UPDATED;
import static com.resourceservice.utilsmodule.constant.Constant.*;
import static com.resourceservice.utilsmodule.constant.ResponseMessageConstant.*;

@Service
@Slf4j
public class RecruiterManagementImpl implements RecruiterManagementService {

    @Autowired
    private RecruiterManagementRepo recruiterManagementRepo;
    @Autowired
    private UserCommonRepo userCommonRepo;
    @Autowired
    private CacheManagerService cacheManagerService;
    @Autowired
    private CommunityService communityService;
    private BearerTokenWrapper tokenWrapper;
    public RecruiterManagementImpl(BearerTokenWrapper tokenWrapper) {
        this.tokenWrapper = tokenWrapper;
    }
    private void saveWallet(Long userId) {
        WalletDTO walletDTO = WalletDTO.builder()
                .userId(userId)
                .addingPoint(BONUS_POINT)
                .build();
        communityService.saveWallet(walletDTO);
    }
    @Override
    public ResponseEntity<Response> saveRecruiterManagement(RecruiterManagementDTO recruiterManagementDTO) {
        HttpStatus httpStatus = HttpStatus.OK;
        Long userId = tokenWrapper.getUid();
        UserCommon userCommon = UserCommon.builder().id(userId).build();
        RecruiterManagement recruiterManagement = RecruiterManagement.builder()
                .id(recruiterManagementDTO.getId())
                .comment(recruiterManagementDTO.getComment())
                .freelancerid(recruiterManagementDTO.getFreelancerId())
                .userCommon(userCommon)
                .ratingstar(recruiterManagementDTO.getRatingStar())
                .updatedate(LocalDateTime.now())
                .note(recruiterManagementDTO.getNote())
                .build();
        if (recruiterManagementDTO.getId() == null) {
            recruiterManagement.setCreationdate(LocalDateTime.now());
        }
        recruiterManagement = (RecruiterManagement) recruiterManagementRepo.save(recruiterManagement);
        Response response = new Response();
        if (recruiterManagement != null) {
            response.setCode(UPDATED);
            response.setMessage(UPDATED);
            saveWallet(userId);
        } else {
            response.setCode(NOT_MODIFY);
            response.setMessage(NOT_MODIFIED);
        }
        return new ResponseEntity(response, httpStatus);
    }
}
