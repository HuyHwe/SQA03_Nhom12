package com.resourceservice.service.impl;


import static com.jober.utilsservice.constant.APIConstant.BS_SEARCH_ORG_SAVE;
import static com.jober.utilsservice.constant.Constant.ACCESS_TOKEN;
import static com.jober.utilsservice.constant.Constant.ACTION_CREATE;
import static com.jober.utilsservice.constant.Constant.ACTION_UPDATE;
import static com.jober.utilsservice.constant.Constant.ACTIVE;
import static com.jober.utilsservice.constant.Constant.CANDIDATE_NUM;
import static com.jober.utilsservice.constant.Constant.CONTACT_PHONE;
import static com.jober.utilsservice.constant.Constant.DATA;
import static com.jober.utilsservice.constant.Constant.ERROR;
import static com.jober.utilsservice.constant.Constant.FAILED;
import static com.jober.utilsservice.constant.Constant.GRANT_TYPE;
import static com.jober.utilsservice.constant.Constant.ID;
import static com.jober.utilsservice.constant.Constant.LOGOUT;
import static com.jober.utilsservice.constant.Constant.NOT_MODIFIED;
import static com.jober.utilsservice.constant.Constant.NULL_CODE;
import static com.jober.utilsservice.constant.Constant.OBJECT_MAPPER;
import static com.jober.utilsservice.constant.Constant.PAGE;
import static com.jober.utilsservice.constant.Constant.PASSWORD;
import static com.jober.utilsservice.constant.Constant.RECRUITER_NUM;
import static com.jober.utilsservice.constant.Constant.REFRESH_TOKEN;
import static com.jober.utilsservice.constant.Constant.SENT_PASSWORD;
import static com.jober.utilsservice.constant.Constant.SIZE;
import static com.jober.utilsservice.constant.Constant.SUCCESS_CODE;
import static com.jober.utilsservice.constant.Constant.TOKEN;
import static com.jober.utilsservice.constant.Constant.TYPE;
import static com.jober.utilsservice.constant.Constant.USERNAME;
import static com.jober.utilsservice.constant.ConstantFields.ORGANIZATION_NAME;
import static com.jober.utilsservice.constant.ConstantFields.PIN;
import static com.jober.utilsservice.constant.ResponseMessageConstant.CREATED;
import static com.jober.utilsservice.constant.ResponseMessageConstant.EXISTED;
import static com.jober.utilsservice.constant.ResponseMessageConstant.EXISTED_ACC;
import static com.jober.utilsservice.constant.ResponseMessageConstant.FOUND;
import static com.jober.utilsservice.constant.ResponseMessageConstant.NOT_CREATED;
import static com.jober.utilsservice.constant.ResponseMessageConstant.NOT_FOUND;
import static com.jober.utilsservice.constant.ResponseMessageConstant.ORG_NULL;
import static com.jober.utilsservice.constant.ResponseMessageConstant.SUCCESS;
import static com.jober.utilsservice.constant.ResponseMessageConstant.UPDATED;
import static com.resourceservice.utilsmodule.constant.Constant.CHANGE_PASS;
import static com.resourceservice.utilsmodule.constant.Constant.EXPIRES_IN;
import static com.resourceservice.utilsmodule.constant.Constant.FORGOT_PASS;
import static com.resourceservice.utilsmodule.constant.Constant.NOT_MODIFY;
import static com.resourceservice.utilsmodule.constant.Constant.TOKEN_OBJ;
import static com.resourceservice.utilsmodule.constant.Constant.USER;
import static com.resourceservice.utilsmodule.constant.ConstantFields.PHONE;
import static com.resourceservice.utilsmodule.constant.ConstantFields.address;
import static com.resourceservice.utilsmodule.constant.ConstantFields.avatar;
import static com.resourceservice.utilsmodule.constant.ConstantFields.country;
import static com.resourceservice.utilsmodule.constant.ConstantFields.creationDate;
import static com.resourceservice.utilsmodule.constant.ConstantFields.dateOfBirth;
import static com.resourceservice.utilsmodule.constant.ConstantFields.detailAddress;
import static com.resourceservice.utilsmodule.constant.ConstantFields.email;
import static com.resourceservice.utilsmodule.constant.ConstantFields.experience;
import static com.resourceservice.utilsmodule.constant.ConstantFields.facebookId;
import static com.resourceservice.utilsmodule.constant.ConstantFields.gender;
import static com.resourceservice.utilsmodule.constant.ConstantFields.googleId;
import static com.resourceservice.utilsmodule.constant.ConstantFields.id;
import static com.resourceservice.utilsmodule.constant.ConstantFields.introPhone;
import static com.resourceservice.utilsmodule.constant.ConstantFields.jobTarget;
import static com.resourceservice.utilsmodule.constant.ConstantFields.loginNumber;
import static com.resourceservice.utilsmodule.constant.ConstantFields.name;
import static com.resourceservice.utilsmodule.constant.ConstantFields.nationality;
import static com.resourceservice.utilsmodule.constant.ConstantFields.packageId;
import static com.resourceservice.utilsmodule.constant.ConstantFields.province;
import static com.resourceservice.utilsmodule.constant.ConstantFields.rating;
import static com.resourceservice.utilsmodule.constant.ConstantFields.receiveInfo;
import static com.resourceservice.utilsmodule.constant.ConstantFields.role;
import static com.resourceservice.utilsmodule.constant.ConstantFields.sendSmsNumber;
import static com.resourceservice.utilsmodule.constant.ConstantFields.sentPassword;
import static com.resourceservice.utilsmodule.constant.ConstantFields.status;
import static com.resourceservice.utilsmodule.constant.ConstantFields.totalMoney;
import static com.resourceservice.utilsmodule.constant.ConstantFields.ward;
import static com.resourceservice.utilsmodule.constant.ConstantFields.withdrawNumber;
import static com.resourceservice.utilsmodule.utils.DateFormaterUtility.DATE_FORMAT_2;

import com.amazonaws.services.amplify.model.BadRequestException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.jober.utilsservice.dto.OrgInputDTO;
import com.jober.utilsservice.dto.WalletDTO;
import com.jober.utilsservice.dto.WalletResDTO;
import com.jober.utilsservice.model.PageableModel;
import com.jober.utilsservice.utils.HttpUtils;
import com.jober.utilsservice.utils.Utility;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.common.CommonUtils;
import com.resourceservice.config.EnvProperties;
import com.resourceservice.config.User.OAuth2UserInfo;
import com.resourceservice.config.User.OAuth2UserInfoFactory;
import com.resourceservice.dto.InputGetTokenDTO;
import com.resourceservice.dto.InputLoginDTO;
import com.resourceservice.dto.ProfileDTO;
import com.resourceservice.dto.RecruiterRateDTO;
import com.resourceservice.dto.UserCommonDTO;
import com.resourceservice.dto.UserInforDto;
import com.resourceservice.dto.request.IntroducedUsersRequest;
import com.resourceservice.dto.request.UserForChangingPass;
import com.resourceservice.dto.request.UserParamDTO;
import com.resourceservice.dto.request.YearRequest;
import com.resourceservice.feign.PaymentFeignClient;
import com.resourceservice.interceptor.BearerTokenWrapper;
import com.resourceservice.model.RecruiterConfiguration;
import com.resourceservice.model.RefreshTokenObject;
import com.resourceservice.model.StatisticalUser;
import com.resourceservice.model.TokenContainer;
import com.resourceservice.model.TokenObject;
import com.resourceservice.model.UserCommon;
import com.resourceservice.repository.FreelancerRepo;
import com.resourceservice.repository.JobRepo;
import com.resourceservice.repository.RecruiterConfigurationRepository;
import com.resourceservice.repository.UserCommonRepo;
import com.resourceservice.service.UserCommonService;
import com.resourceservice.utilsmodule.CacheService;
import com.resourceservice.utilsmodule.constant.Constant;
import com.resourceservice.utilsmodule.constant.RecruiterStatus;
import com.resourceservice.utilsmodule.errors.OAuth2AuthenticationProcessingException;
import com.resourceservice.utilsmodule.errors.RestExceptionHandler;
import com.resourceservice.utilsmodule.utils.DateFormaterUtility;
import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
@Log4j2
@Slf4j
@RequiredArgsConstructor
public class UserCommonServiceImpl implements UserCommonService {

  public static ResponseObject responseObject;
  public static Logger LOGGER = LoggerFactory.getLogger(UserCommonServiceImpl.class);
  private final PaymentFeignClient paymentFeignClient;
  private final ObjectMapper mapper;
  private final BearerTokenWrapper tokenWrapper;
  @Autowired
  S3ServiceImpl s3Service;
  @Autowired
  CommonUtils utils;
  @Autowired
  private EnvProperties envProperties;
  @Autowired
  private UserCommonRepo userCommonRepo;
  @Autowired
  private CacheService cacheService;
  @Autowired
  private CacheManager cacheManager;
  @Autowired
  private RestExceptionHandler restExceptionHandler;
  @Autowired
  private CommunityService communityService;
  @Autowired
  private CacheManagerService cacheManagerService;
  @Autowired
  private JobRepo jobRepo;
  @Autowired
  private FreelancerRepo freelancerRepo;
  @Value("${security.oauth2.client.client-id}")
  private String clientId;
  @Value("${security.oauth2.client.client-secret}")
  private String clientSecret;

  @Autowired
  private RecruiterConfigurationRepository recruiterConfigurationRepository;

  public PasswordEncoder bCryptPasswordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Override
  public ResponseObject findUserByPhoneNumber(UserParamDTO userParamDTO) {
    UserCommon dUserCommon = null;
    if (userParamDTO.getPhone() != null) {
      dUserCommon = userCommonRepo.findByPhoneEquals(userParamDTO.getPhone());
    } else if (userParamDTO.getEmail() != null) {
      dUserCommon = userCommonRepo.findByEmail(userParamDTO.getEmail());
    }
    if (dUserCommon != null) {
      WalletResDTO walletResDTO = communityService.getWalletByUser(dUserCommon.getId());
      if (walletResDTO == null) {
        dUserCommon.setBonusPoint(new BigDecimal(0));
      } else {
        dUserCommon.setBonusPoint(walletResDTO.getTotalPoint());
      }
      List<Object[]> results = userCommonRepo.getCountRatingForStar(dUserCommon.getId());
      RecruiterRateDTO recruiterRateDTO = new RecruiterRateDTO();
      if (results != null) {
        recruiterRateDTO = utils.getRecruiterRateForUser(results);
      }
      ProfileDTO profileDTO = ProfileDTO.builder().
          id(dUserCommon.getId()).
          name(dUserCommon.getName()).
          phone(dUserCommon.getPhone()).
          dateOfBirth(dUserCommon.getDateOfBirth()).
          gender(dUserCommon.getGender()).
          email(dUserCommon.getEmail()).
          avatar(dUserCommon.getAvatar()).
          nationality(dUserCommon.getNationality()).
          province(dUserCommon.getProvince()).
          ward(dUserCommon.getWard()).
          organizationId(dUserCommon.getOrganizationId()).
          role(dUserCommon.getRole()).
          recruiterRate(recruiterRateDTO).
          jobTarget(dUserCommon.getJobTarget()).
          experience(dUserCommon.getExperience()).
          detailAddress(dUserCommon.getDetailAddress()).
          build();
      responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
          1L,
          1, 1, profileDTO);
    } else {
      responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
          0L,
          0, null);
    }
    return responseObject;
  }

  private UserCommon convertBodyToUserCommon(String body, String type, UserCommon userCommon)
      throws JsonProcessingException {
    Map<String, Object> map = OBJECT_MAPPER.readValue(body, Map.class);
    if (userCommon == null) {
      userCommon = new UserCommon();
    }
    UserCommon finalUserCommon = userCommon;
    int creationPin = 0;
    if (ACTION_CREATE.equals(type)) {
//            create user
      if (map.get(PASSWORD) != null && !map.get(PASSWORD).toString().isEmpty()) {
        byte[] decodedBytes = Base64.getDecoder().decode(map.get(PASSWORD).toString());
        String pass = new String(decodedBytes);
        finalUserCommon.setPin(pass);
      } else {
        creationPin = Utility.generatePin();
        finalUserCommon.setPin(String.valueOf(creationPin));
      }
    } else if (FORGOT_PASS.equals(type)) {
//            forgot password
      creationPin = Utility.generatePin();
      finalUserCommon.setPin(String.valueOf(creationPin));
    } else if (CHANGE_PASS.equals(type)) {
      byte[] decodedBytes = Base64.getDecoder().decode(map.get(PASSWORD).toString());
      String pass = new String(decodedBytes);
    }
    map.forEach((key, val) -> {
      switch (key) {
        case id:
          if (map.get(id) != null) {
            finalUserCommon.setId(Long.parseLong(map.get(id).toString()));
          }
          break;
        case PIN:
//                    update password
          String pin = null;
          if (ACTION_UPDATE.equals(type)) {
            byte[] decodedBytes = Base64.getDecoder().decode(map.get(PIN).toString());
            pin = new String(decodedBytes);
          }
          String pinEncode = bCryptPasswordEncoder().encode(pin);
          finalUserCommon.setPin(pinEncode);
          break;
        case PHONE:
          if (map.get(PHONE) != null) {
            finalUserCommon.setPhone(String.valueOf(map.get(PHONE)));
          }
          break;
        case status:
          if (map.get(status) != null) {
            finalUserCommon.setStatus(String.valueOf(map.get(status)));
          }
          break;
        case totalMoney:
          if (map.get(totalMoney) != null) {
            finalUserCommon.setTotalMoney(Double.parseDouble(map.get(totalMoney).toString()));
          }
          break;
        case rating:
          if (map.get(rating) != null) {
            finalUserCommon.setRating(Integer.parseInt(map.get(rating).toString()));
          }
          break;
        case role:
          if (map.get(role) != null) {
            finalUserCommon.setRole(Integer.parseInt(map.get(role).toString()));
          }
          break;
        case loginNumber:
          if (map.get(loginNumber) != null) {
            finalUserCommon.setLoginNumber(Long.parseLong(map.get(loginNumber).toString()));
          }
          break;
        case withdrawNumber:
          if (map.get(withdrawNumber) != null) {
            finalUserCommon.setWithdrawNumber(Integer.parseInt(map.get(withdrawNumber).toString()));
          }
          break;
        case introPhone:
          if (map.get(introPhone) != null) {
            finalUserCommon.setIntroPhone(String.valueOf(map.get(introPhone)));
          }
          break;
                /*case bonusPoint:
                    if (map.get(bonusPoint) != null)
                    finalUserCommon.setBonusPoint(Double.parseDouble(map.get(bonusPoint).toString()));
                    break;*/
        case email:
          if (map.get(email) != null) {
            finalUserCommon.setEmail(String.valueOf(map.get(email)));
          }
          break;
        case avatar:
          if (map.get(avatar) != null) {
            finalUserCommon.setAvatar(String.valueOf(map.get(avatar)));
          }
          break;
        case sentPassword:
          if (map.get(sentPassword) != null) {
            finalUserCommon.setAvatar(String.valueOf(map.get(sentPassword)));
          }
          break;
        case facebookId:
          if (map.get(facebookId) != null) {
            finalUserCommon.setFacebookId(String.valueOf(map.get(facebookId)));
          }
          break;
        case googleId:
          if (map.get(googleId) != null) {
            finalUserCommon.setGoogleId(String.valueOf(map.get(googleId)));
          }
          break;
        case receiveInfo:
          if (map.get(receiveInfo) != null) {
            finalUserCommon.setReceiveInfo(Integer.parseInt(map.get(receiveInfo).toString()));
          }
          break;
        case sendSmsNumber:
          if (map.get(sendSmsNumber) != null) {
            finalUserCommon.setSendSmsNumber(Integer.parseInt(map.get(sendSmsNumber).toString()));
          }
          break;
        case creationDate:
          if (map.get(type) != null) {
            if (ACTION_CREATE.equals(type)) {
              finalUserCommon.setCreationDate(DateFormaterUtility.getLocalDate(
                  (DateFormaterUtility.getCreationDate(new Date(),
                      DateFormaterUtility.DATE_FORMAT_1)), DateFormaterUtility.DATE_FORMAT_1));
            }
          }
        case dateOfBirth:
          if (map.get(dateOfBirth) != null) {
            String dateStr = map.get(dateOfBirth).toString();
            LocalDateTime date = DateFormaterUtility.getLocalDate_1(dateStr, DATE_FORMAT_2);
            finalUserCommon.setDateOfBirth(date);
          }
        case country:
          if (map.get(country) != null) {
            finalUserCommon.setCountry(map.get(country).toString());
          }
        case nationality:
          if (map.get(nationality) != null) {
            finalUserCommon.setNationality(map.get(nationality).toString());
          }
        case name:
          if (map.get(name) != null) {
            finalUserCommon.setName(map.get(name).toString());
          }
        case gender:
          if (map.get(gender) != null) {
            finalUserCommon.setGender(map.get(gender).toString());
          }
        case address:
          if (map.get(address) != null) {
            finalUserCommon.setAddress(map.get(address).toString());
          }
        case jobTarget:
          if (map.get(jobTarget) != null) {
            finalUserCommon.setJobTarget(map.get(jobTarget).toString());
          }
        case experience:
          if (map.get(experience) != null) {
            finalUserCommon.setExperience(map.get(experience).toString());
          }
        case province:
          if (map.get(province) != null) {
            finalUserCommon.setProvince(map.get(province).toString());
          }
        case ward:
          if (map.get(ward) != null) {
            finalUserCommon.setWard(map.get(ward).toString());
          }
        case detailAddress:
          if (map.get(detailAddress) != null) {
            finalUserCommon.setDetailAddress(map.get(detailAddress).toString());
          }
        case packageId:
          if (map.get(packageId) != null) {
            finalUserCommon.setPackageId(Long.parseLong(map.get(packageId).toString()));
          }
      }
      finalUserCommon.setUpdateDate(DateFormaterUtility.getLocalDate(
          (DateFormaterUtility.getCreationDate(new Date(), DateFormaterUtility.DATE_FORMAT_1)),
          DateFormaterUtility.DATE_FORMAT_1));
    });
    return finalUserCommon;
  }

  private WalletDTO saveWallet(String phone, Long userId) {
    WalletResDTO walletResDTO = communityService.getWalletByUser(userId);
    WalletDTO walletDTO;
    if (walletResDTO != null) {
      walletDTO = WalletDTO.builder()
          .id(walletResDTO.getId())
          .userId(userId)
          .totalMoney(walletResDTO.getTotalMoney())
          .addingPoint(new BigDecimal(5))
//                    .totalPoint(walletResDTO.getTotalPoint().add(new BigDecimal(5)))
          .build();
    } else {
      walletDTO = WalletDTO.builder()
          .userPhone(phone)
          .userId(userId)
          .totalMoney(0L)
          .totalPoint(new BigDecimal(100))
          .build();
    }
    communityService.saveWallet(walletDTO);
    return walletDTO;
  }

  private Long saveOrg(String body) {
    OrgInputDTO orgInputDTO = new OrgInputDTO();
    try {
      Map<String, Object> map = OBJECT_MAPPER.readValue(body, Map.class);
      if (map.get(ORGANIZATION_NAME) == null) {
        return null;
      }
      orgInputDTO.setName(map.get(ORGANIZATION_NAME).toString());
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
    String uri = envProperties.getSearchServiceURI() + BS_SEARCH_ORG_SAVE;
    ResponseEntity responseEntity = HttpUtils.postData(orgInputDTO, null, uri);
    Map<String, Object> result;
    try {
      result = OBJECT_MAPPER.readValue(responseEntity.getBody().toString(), Map.class);
      Map<String, Object> data = (Map<String, Object>) result.get(DATA);
      return Long.parseLong(data.get(ID).toString());
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }
    /*private void updateBonusPointForIntroUser(String introPhone) {
        UserCommon introUser = userCommonRepo.findByPhoneEquals(introPhone);
        if (introUser != null) {
            if (introUser.getBonusPoint() != null) {
                introUser.setBonusPoint(introUser.getBonusPoint() + 5);
            } else {
                introUser.setBonusPoint(5d);
            }
            Map map = null;
            try {
                map = OBJECT_MAPPER.readValue(OBJECT_MAPPER.writeValueAsString(introUser), Map.class);
                map.remove(PIN);
                saveOrUpdate(OBJECT_MAPPER.writeValueAsString(map));
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        }
    }*/

  @Override
//    @Transactional
  public ResponseObject createUser(String body) {
    try {
      Long orgId = saveOrg(body);
      UserCommon userCommonBody = convertBodyToUserCommon(body, ACTION_CREATE, null);
      UserCommon userCommon = userCommonRepo.findByPhoneEquals(userCommonBody.getPhone());
      if (userCommon != null || userCommonRepo.findByEmail(userCommonBody.getEmail()) != null) {
        responseObject = Utility.responseObject(NOT_CREATED, EXISTED, EXISTED_ACC, null);
        return responseObject;
      }
      String pin = userCommonBody.getPin();
      String pinEncode = bCryptPasswordEncoder().encode(pin);
      userCommonBody.setPin(pinEncode);
      userCommonBody.setActive(ACTIVE);
      userCommonBody.setCreationDate(LocalDateTime.now());

      UserCommon userSave = (UserCommon) userCommonRepo.save(userCommonBody);

      if (orgId != null) {
        userCommonBody.setOrganizationId(orgId);
        RecruiterConfiguration recruiter = new RecruiterConfiguration();

        recruiter.setOrganizationId((orgId));

        recruiter.setCusId(userSave.getId());

        recruiter.setStatus(RecruiterStatus.PENDING);

        recruiterConfigurationRepository.save(recruiter);

      } else {
        if (userCommonBody.getRole().equals(RECRUITER_NUM)) {
          responseObject = Utility.responseObject(NOT_CREATED, FAILED, ORG_NULL, null);
          return responseObject;
        }
      }

      if (userSave != null && Optional.of(userSave).isPresent()) {
        String toPhoneNumber = userCommonBody.getPhone();
        String content = Utility.getContent(SENT_PASSWORD, pin, toPhoneNumber, CONTACT_PHONE);
        LOGGER.info("content: " + content);
        Utility.isSendSMS(content, toPhoneNumber, CONTACT_PHONE);
        saveWallet(toPhoneNumber, userCommonBody.getId());

        String introPhone = userCommonBody.getIntroPhone();
        UserCommon introUser = userCommonRepo.findByPhoneEquals(introPhone);

        if (introPhone != null && !introPhone.isEmpty()) {
          WalletDTO walletDTO = saveWallet(introPhone, introUser.getId());
          userSave.setBonusPoint(walletDTO.getTotalPoint());
        }
        responseObject = new ResponseObject(String.valueOf(HttpStatus.OK), SUCCESS_CODE, CREATED,
            1L, 1, 1, new ArrayList<>(Arrays.asList(userSave)));
      }
    } catch (JsonProcessingException | NullPointerException e) {
      responseObject = Utility.responseObject(ERROR, null, null, null);
      LOGGER.error("Exception from createUser()", e);
    } catch (IOException e) {
      LOGGER.error("createUser() is error: " + e);
    }
    return responseObject;
  }

  private void saveRecruiter(RecruiterConfiguration recruiter) {

  }

  @Override
  public ResponseObject saveUser(String body) {
    HttpStatus httpStatus = null;
    try {
      Map<String, String> fields = OBJECT_MAPPER.readValue(body, Map.class);
      UserCommon userCommon = userCommonRepo.findByPhoneEquals(fields.get(PHONE));
      String pin = null;
      if (fields.containsKey(TYPE) && FORGOT_PASS.equals(fields.get(TYPE))) {
//                forgot pass
        userCommon = convertBodyToUserCommon(body, FORGOT_PASS, userCommon);
        pin = userCommon.getPin();
        userCommon.setPin(bCryptPasswordEncoder().encode(pin));
      } else {
//                update user
        userCommon = convertBodyToUserCommon(body, ACTION_UPDATE, userCommon);
      }

      if (Optional.of(userCommon).isPresent()) {
        UserCommon updateUserCommon = (UserCommon) userCommonRepo.save(userCommon);
//                sent to phone when forgot password
        if (updateUserCommon != null && Optional.of(updateUserCommon).isPresent() && (
            fields.containsKey(TYPE) && FORGOT_PASS.equals(fields.get(TYPE)))) {
          String toPhoneNumber = updateUserCommon.getPhone();
          String content = Utility.getContent(SENT_PASSWORD, pin, toPhoneNumber, CONTACT_PHONE);
          Utility.isSendSMS(content, toPhoneNumber, CONTACT_PHONE);
        }
        UserCommonDTO userCommonDTO = buildUserCommonDTO(updateUserCommon);
        return Utility.responseObject(String.valueOf(HttpStatus.OK), SUCCESS_CODE, UPDATED,
            Arrays.asList(userCommonDTO));
      }
    } catch (JsonProcessingException | NullPointerException e) {
      httpStatus = HttpStatus.NOT_MODIFIED;
      LOGGER.error("Error from saveOrUpdate user common: ", e);
    } catch (IOException e) {
      httpStatus = HttpStatus.NOT_MODIFIED;
      LOGGER.error("Error from saveOrUpdate user common: ", e);
    }
    responseObject = Utility.responseObject(String.valueOf(httpStatus), NOT_MODIFY, NOT_MODIFIED,
        null);
    return responseObject;
  }

  @Override
  public ResponseObject forgetPassword(UserForChangingPass param) {
    UserCommon userCommon = userCommonRepo.findByPhoneEquals(param.getPhone());
    if (userCommon == null) {
      return Utility.responseObject(String.valueOf(HttpStatus.EXPECTATION_FAILED), FAILED,
          NOT_MODIFIED, null);
    }
    int newPin = Utility.generatePin();
    userCommon.setPin(bCryptPasswordEncoder().encode(String.valueOf(newPin)));

    UserCommon updateUserCommon = (UserCommon) userCommonRepo.save(userCommon);
    UserCommonDTO userCommonDTO = buildUserCommonDTO(updateUserCommon);
    String content = Utility.getContent(SENT_PASSWORD, String.valueOf(newPin), param.getPhone(),
        CONTACT_PHONE);
    Utility.isSendSMS(content, param.getPhone(), CONTACT_PHONE);
    return Utility.responseObject(String.valueOf(HttpStatus.OK), SUCCESS_CODE, UPDATED,
        Arrays.asList(userCommonDTO));
  }

  @Override
  public ResponseEntity<?> getListAdmin(String body) {
    HttpStatus httpStatus = null;
    try {
      Map map = OBJECT_MAPPER.readValue(body, Map.class);
      int viceAdminRole = Integer.parseInt(map.get(Constant.viceAdminRole).toString());
      int adminRole = Integer.parseInt(map.get(Constant.adminRole).toString());
      int page = Integer.parseInt(map.get(PAGE).toString());
      int size = Integer.parseInt(map.get(SIZE).toString());
      Pageable pageable = PageRequest.of(page - 1, size);
      Page<UserCommon> adminsPage = userCommonRepo.findAdmins(viceAdminRole, adminRole, pageable);
      List<UserCommonDTO> userCommonDTOS = new ArrayList<>();
      if (adminsPage != null && Optional.of(adminsPage).isPresent()) {
        List<UserCommon> admins = adminsPage.getContent();
        userCommonDTOS = admins.stream()
            .map(this::buildUserCommonDTO).collect(Collectors.toList());
      }
      responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
          adminsPage.getTotalElements(),
          userCommonDTOS.size(), adminsPage.getTotalPages(), userCommonDTOS);
      httpStatus = HttpStatus.OK;
      return new ResponseEntity(responseObject, httpStatus);
    } catch (NullPointerException e) {
      return restExceptionHandler.handleNullPointerException(e);
    } catch (JsonMappingException e) {
      LOGGER.error("", e);
    } catch (JsonProcessingException e) {
      LOGGER.error("", e);
    }
    responseObject = new ResponseObject(ERROR, NULL_CODE, FAILED,
        0L,
        0, new ArrayList<>());
    return new ResponseEntity(responseObject, HttpStatus.NOT_FOUND);
  }

  @Override
  public ResponseEntity obtainAccessToken(InputGetTokenDTO body) {
    String url = envProperties.getAuthServerURI() + "oauth/token";
    LOGGER.info("obtainAccessToken url: " + url);
    ResponseEntity<String> response = null;
    try {
//            create header
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
      headers.setBasicAuth(clientId, clientSecret);

//            create body
      MultiValueMap<String, String> map = new LinkedMultiValueMap();
      map.add(GRANT_TYPE, PASSWORD);
      map.add(USERNAME, body.getUsername());
      byte[] decodedBytes = Base64.getDecoder().decode(body.getPassword());
      String pass = new String(decodedBytes);
      map.add(PASSWORD, pass);
//            excute
      HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity(map, headers);
      RestTemplate restTemplate = new RestTemplate();
      response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

    } catch (Exception e) {
      LOGGER.error("obtainAccessToken Exception: " + e);
    }
    return response;
  }

  public ResponseEntity<ResponseObject> saveOrUpdateAvatar(Long userId, MultipartFile file) {
    ResponseObject object = new ResponseObject();
    HttpStatus httpStatus = null;
    try {
      File fileUpload = utils.convert(file);
      Optional<UserCommon> findResult = userCommonRepo.findById(userId);
      UserCommon userCommon = null;

      if (findResult.isPresent()) {

        userCommon = (UserCommon) findResult.get();

        if (!StringUtils.isEmpty(userCommon.getAvatar()) || userCommon.getAvatar() != null) {
          s3Service.deleteFile(userCommon.getAvatar());
        }

        userCommon.setAvatar(userId + fileUpload.getName());
        UserCommon updateUserCommon = (UserCommon) userCommonRepo.save(userCommon);
        s3Service.uploadFile(userId, fileUpload);
        fileUpload.delete();
        object = new ResponseObject(UPDATED, SUCCESS_CODE, SUCCESS,
            0L,
            0, new ArrayList<>());
        httpStatus = HttpStatus.OK;
      }
    } catch (Exception e) {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      object = new ResponseObject(ERROR, NULL_CODE, FAILED,
          0L,
          0, new ArrayList<>());
      log.error("saveOrUpdateAvatar: ", e);
    }

    return new ResponseEntity(object, httpStatus);
  }

  /**
   * Remove token from cache when logout
   *
   * @param
   * @return
   */
  @Override
  public ResponseEntity logout() {
    cacheService.evictSingleCacheValue(cacheManager, TOKEN, ACCESS_TOKEN + tokenWrapper.getUid());
    cacheService.evictSingleCacheValue(cacheManager, TOKEN, REFRESH_TOKEN + tokenWrapper.getUid());
    Response response = new Response(SUCCESS, SUCCESS_CODE, LOGOUT);
    return new ResponseEntity(response, HttpStatus.OK);
  }

  public UserCommonDTO buildUserCommonDTO(UserCommon userCommon) {
    UserCommonDTO userCommonDTO = new UserCommonDTO();
    try {
      userCommonDTO.setId(userCommon.getId());
      userCommonDTO.setName(userCommon.getName());
      userCommonDTO.setAddress(userCommon.getAddress());
      userCommonDTO.setAvatar(userCommon.getAvatar());
      userCommonDTO.setPhone(userCommon.getPhone());
      userCommonDTO.setRole(userCommon.getRole());
      userCommonDTO.setEmail(userCommon.getEmail());
      userCommonDTO.setStatus(userCommon.getStatus());
      userCommonDTO.setRating(userCommon.getRating());
      userCommonDTO.setIntroPhone(userCommon.getIntroPhone());
      userCommonDTO.setTotalMoney(userCommon.getTotalMoney());
      userCommonDTO.setFacebookId(userCommon.getFacebookId());
      userCommonDTO.setCreationDate(userCommon.getCreationDate());
      userCommonDTO.setProvince(userCommon.getProvince());
      userCommonDTO.setWard(userCommon.getWard());
      userCommonDTO.setDetailAddress(userCommon.getDetailAddress());
      userCommonDTO.setJobTarget(userCommon.getJobTarget());
      userCommonDTO.setExperience(userCommon.getExperience());
      userCommonDTO.setGender(userCommon.getGender());
      userCommonDTO.setDateOfBirth(userCommon.getDateOfBirth());
      userCommonDTO.setOrganizationId(userCommon.getOrganizationId());
    } catch (NullPointerException e) {
      LOGGER.error("buildUserCommonDTO: " + e);
    }
    return userCommonDTO;
  }

  @Override
  public ResponseEntity<?> login(InputLoginDTO inputLoginDTO) {
    try {
      Map<String, Object> mapResponse = new HashMap<>();
      InputGetTokenDTO inputGetTokenDTO = inputLoginDTO.getBodyGetToken();
      ResponseEntity<String> responseEntityToken = this.obtainAccessToken(inputGetTokenDTO);

      String phoneNumber = inputGetTokenDTO.getUsername();
      UserCommon dUserCommon = userCommonRepo.findByPhoneEquals(phoneNumber);
      UserCommonDTO userCommonDTO = buildUserCommonDTO(dUserCommon);
      String uid = userCommonDTO.getId().toString();
      LOGGER.info("login uid: ", uid);
      TokenContainer tokenContainer = OBJECT_MAPPER.readValue(responseEntityToken.getBody(),
          TokenContainer.class);

      cacheService.putCache(cacheManager, USER, USER + uid, userCommonDTO);
      cacheService.putCache(cacheManager, TOKEN, ACCESS_TOKEN + uid,
          tokenContainer.getAccessToken());
      cacheService.putCache(cacheManager, TOKEN, REFRESH_TOKEN + uid,
          tokenContainer.getRefreshToken());
      cacheService.putCache(cacheManager, TOKEN, EXPIRES_IN + uid, tokenContainer.getExpireTime());
      mapResponse.put(USER, userCommonDTO);
      mapResponse.put(TOKEN_OBJ, OBJECT_MAPPER.writeValueAsString(
          (TokenObject.builder().accessToken(tokenContainer.getAccessToken()).build())));
      return new ResponseEntity(mapResponse, HttpStatus.OK);
    } catch (NullPointerException e) {
      LOGGER.error("login Exception: " + e);
    } catch (JsonMappingException e) {
      throw new RuntimeException(e);
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
    return new ResponseEntity(FAILED, null, HttpStatus.EXPECTATION_FAILED);
  }

  @Override
  public ResponseEntity<?> adminLogin(InputLoginDTO inputLoginDTO) {
    try {
      Map<String, Object> mapResponse = new HashMap<>();
      InputGetTokenDTO inputGetTokenDTO = inputLoginDTO.getBodyGetToken();
      ResponseEntity<String> responseEntityToken = this.obtainAccessToken(inputGetTokenDTO);

      String phoneNumber = inputGetTokenDTO.getUsername();
      UserCommon dUserCommon = userCommonRepo.findByPhoneEquals(phoneNumber);
      UserCommonDTO userCommonDTO = buildUserCommonDTO(dUserCommon);
      String uid = userCommonDTO.getId().toString();
      System.out.println("role: "+ userCommonDTO.getRole());
      if(userCommonDTO.getRole()!=4){

        return new ResponseEntity(FAILED, null, HttpStatus.EXPECTATION_FAILED);

      }
      LOGGER.info("login uid: ", uid);
      TokenContainer tokenContainer = OBJECT_MAPPER.readValue(responseEntityToken.getBody(),
              TokenContainer.class);

      cacheService.putCache(cacheManager, USER, USER + uid, userCommonDTO);
      cacheService.putCache(cacheManager, TOKEN, ACCESS_TOKEN + uid,
              tokenContainer.getAccessToken());
      cacheService.putCache(cacheManager, TOKEN, REFRESH_TOKEN + uid,
              tokenContainer.getRefreshToken());
      cacheService.putCache(cacheManager, TOKEN, EXPIRES_IN + uid, tokenContainer.getExpireTime());
      mapResponse.put(USER, userCommonDTO);
      mapResponse.put(TOKEN_OBJ, OBJECT_MAPPER.writeValueAsString(
              (TokenObject.builder().accessToken(tokenContainer.getAccessToken()).build())));
      return new ResponseEntity(mapResponse, HttpStatus.OK);
    } catch (NullPointerException e) {
      LOGGER.error("login Exception: " + e);
    } catch (JsonMappingException e) {
      throw new RuntimeException(e);
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
    return new ResponseEntity(FAILED, null, HttpStatus.EXPECTATION_FAILED);
  }

  @Override
  public OidcUser processUserOidc(String registrationId, Map<String, Object> attributes,
      OidcUser oidcUser) {
    OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId,
        attributes);
        /*if (StringUtils.isEmpty(oAuth2UserInfo.getName())) {
            throw new OAuth2AuthenticationProcessingException("Name not found from OAuth2 provider");
        } else */
    if (StringUtils.isEmpty(oAuth2UserInfo.getEmail())) {
      throw new OAuth2AuthenticationProcessingException("Email not found from OAuth2 provider");
    }
    UserCommon userCommon = null;
    userCommon = userCommonRepo.findByPhoneEquals(oAuth2UserInfo.getEmail());
    if (userCommon == null) {
      userCommon = new UserCommon();
      userCommon.setAvatar(oAuth2UserInfo.getImageUrl());
      userCommon.setEmail(oAuth2UserInfo.getEmail());
      userCommon.setPhone(oAuth2UserInfo.getEmail());
      userCommon.setCreationDate(LocalDateTime.now());
      userCommon.setGoogleId(oAuth2UserInfo.getId());
      userCommon.setRole(Integer.valueOf(CANDIDATE_NUM));
      userCommon.setPin(this.generateCommonLangPassword());
      userCommon = createNewOne(userCommon);
    }
    return oidcUser;
  }

  @Override
  public OAuth2User processUserOAuth2(String registrationId, Map<String, Object> attributes,
      OAuth2User oidcUser) {
    OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId,
        attributes);
        /*if (StringUtils.isEmpty(oAuth2UserInfo.getName())) {
            throw new OAuth2AuthenticationProcessingException("Name not found from OAuth2 provider");
        } else if (StringUtils.isEmpty(oAuth2UserInfo.getEmail())) {
            throw new OAuth2AuthenticationProcessingException("Email not found from OAuth2 provider");
        }*/
//        CustomOAuth2User customOAuth2User = (CustomOAuth2User) oidcUser;
    if (StringUtils.isEmpty(oAuth2UserInfo.getEmail())) {
      throw new OAuth2AuthenticationProcessingException("Email not found from OAuth2 provider");
    }
    UserCommon userCommon = null;
    userCommon = userCommonRepo.findByPhoneEquals(oAuth2UserInfo.getEmail());
    if (userCommon == null) {
      userCommon = new UserCommon();
      userCommon.setAvatar(oAuth2UserInfo.getImageUrl());
      userCommon.setName(oAuth2UserInfo.getEmail());
      userCommon.setEmail(oAuth2UserInfo.getEmail());
      userCommon.setPhone(oAuth2UserInfo.getEmail());
      userCommon.setCreationDate(LocalDateTime.now());
      userCommon.setFacebookId(oAuth2UserInfo.getId());
      userCommon.setRole(Integer.valueOf(CANDIDATE_NUM));
//            userCommon.setPin(this.generateCommonLangPassword());
      userCommon.setPin("123456");
      userCommon.setActive(ACTIVE);
      userCommon.setAvatar(oAuth2UserInfo.getImageUrl());
      userCommon = createNewOne(userCommon);
      saveWallet(userCommon.getPhone(), userCommon.getId());
    }
    UserCommonDTO userCommonDTO = buildUserCommonDTO(userCommon);
    final String cacheKey = USER + userCommonDTO.getId().toString();
    LOGGER.info("login cacheKey", cacheKey);
    cacheService.putCache(cacheManager, USER, cacheKey, userCommonDTO);
    return oidcUser;
  }

  @Override
  public OAuth2User processUserOAuth2(GoogleIdToken.Payload payload) {
    UserCommon userCommon = null;
    userCommon = userCommonRepo.findByPhoneEquals(payload.getEmail());
    if (userCommon == null) {
      userCommon = new UserCommon();
      userCommon.setName((String) payload.get("name"));
      userCommon.setEmail(payload.getEmail());
      userCommon.setPhone(payload.getEmail());
      userCommon.setCreationDate(LocalDateTime.now());
      userCommon.setRole(Integer.valueOf(CANDIDATE_NUM));
      userCommon.setPin("123456");
      userCommon.setActive(ACTIVE);
      userCommon = createNewOne(userCommon);
      saveWallet(userCommon.getPhone(), userCommon.getId());
    }
    UserCommonDTO userCommonDTO = buildUserCommonDTO(userCommon);
    final String cacheKey = USER + userCommonDTO.getId().toString();
    LOGGER.info("login cacheKey", cacheKey);
    cacheService.putCache(cacheManager, USER, cacheKey, userCommonDTO);
    Map<String, Object> attributes = payload;
    return new DefaultOAuth2User(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")),
        attributes, "name");

  }

  public String generateCommonLangPassword() {
    String upperCaseLetters = RandomStringUtils.random(2, 65, 90, true, true);
    String lowerCaseLetters = RandomStringUtils.random(2, 97, 122, true, true);
    String numbers = RandomStringUtils.randomNumeric(2);
    String specialChar = RandomStringUtils.random(2, 33, 47, false, false);
    String totalChars = RandomStringUtils.randomAlphanumeric(2);
    String combinedChars = upperCaseLetters.concat(lowerCaseLetters)
        .concat(numbers)
        .concat(specialChar)
        .concat(totalChars);
    List<Character> pwdChars = combinedChars.chars()
        .mapToObj(c -> (char) c)
        .collect(Collectors.toList());
    Collections.shuffle(pwdChars);
    String password = pwdChars.stream()
        .collect(StringBuilder::new, StringBuilder::append, StringBuilder::append)
        .toString();
    return password;
  }

  @Override
  public UserCommon createNewOne(UserCommon userCommon) {
    UserCommon userSave = null;
    try {
      String pin = userCommon.getPin();
      String pinEncode = bCryptPasswordEncoder().encode(pin);
      userCommon.setPin(pinEncode);
      userSave = (UserCommon) userCommonRepo.save(userCommon);
    } catch (NullPointerException e) {
      LOGGER.error("Exception from createUser()", e);
    }
    return userSave;
  }

  @Override
  public ResponseEntity<?> getUserInfo(String username) {
    UserCommon dUserCommon = userCommonRepo.findByPhoneEquals(username);
    UserCommonDTO userCommonDTO = buildUserCommonDTO(dUserCommon);
    return ResponseEntity.ok(userCommonDTO);
  }

  @Override
  public ResponseEntity<ResponseObject> getListRecruiterManagementByUserId(Long userId) {
    HttpStatus httpStatus = null;
    ResponseObject object;
    ProfileDTO profileDTO = userCommonRepo.findProfileByUid(userId);
    if (profileDTO != null && Optional.of(profileDTO).isPresent()) {
      List<Object[]> results = userCommonRepo.getCountRatingForStar(userId);
      profileDTO.setRecruiterRate(utils.getRecruiterRateForUser(results));
      object = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
          1L,
          1, profileDTO);
      httpStatus = HttpStatus.OK;
    } else {
      object = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
          0L,
          0, null);

      httpStatus = HttpStatus.OK;
    }
    return new ResponseEntity(object, httpStatus);
  }

  @Override
  public ResponseEntity<ResponseObject> updateInforUser(Long userId, UserInforDto userInforDto) {

    ResponseObject object;
    HttpStatus httpStatus = null;

    try {

      Optional<UserCommon> common = userCommonRepo.findById(userId);

      if (common.isEmpty()) {

        httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        object = new ResponseObject(ERROR, NULL_CODE, FAILED,
            0L,
            0, new ArrayList<>());
        log.error("UserCommon.Not.Exist");

        return new ResponseEntity(object, httpStatus);
      }

      if (Optional.of(userInforDto.getEmail()).isPresent()
          && !common.get().getEmail().equals(userInforDto.getEmail())) {
        common.get().setEmail(userInforDto.getEmail());
      }

      ResponseEntity responseEntity = saveOrUpdateAvatar(userId, userInforDto.getFile());

      if (responseEntity.getStatusCode().equals(HttpStatus.OK)) {

        object = new ResponseObject(UPDATED, SUCCESS_CODE, SUCCESS,
            0L,
            0, new ArrayList<>());
        httpStatus = HttpStatus.OK;
      } else {
        httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        object = new ResponseObject(NOT_MODIFIED, NOT_MODIFY, FAILED,
            0L,
            0, new ArrayList<>());
      }
    } catch (Exception e) {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      object = new ResponseObject(ERROR, NULL_CODE, FAILED,
          0L,
          0, new ArrayList<>());
      log.error("updateInforUser: ", e);
    }

    return new ResponseEntity(object, httpStatus);
  }

  @Override
  public ResponseEntity<ResponseObject> adminGetListIntroducedUsers(
      IntroducedUsersRequest introducedUsersRequest) {
    HttpStatus httpStatus;
    try {
      PageableModel pageableModel = introducedUsersRequest.getPageableModel();
      int page = pageableModel.getPage();
      int size = pageableModel.getSize();
      Pageable pageable = PageRequest.of(page - 1, size);
      List<Integer> roles = Arrays.asList(CANDIDATE_NUM, RECRUITER_NUM);
      String introPhone = introducedUsersRequest.getIntroPhone();
      System.out.println("introphone: " + introPhone);
      Page<UserCommon> userCommons = userCommonRepo.findIntroducedUsers(roles, introPhone,
          pageable);
//            List<UserCommon> userCommons = userCommonRepo.findIntroducedUsers(roles, introPhone);
      if (userCommons != null && Optional.of(userCommons).isPresent()) {
        List<UserCommonDTO> listUserCommonDTO = userCommons
            .stream()
            .map(this::buildUserCommonDTO).collect(Collectors.toList());
        responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
            userCommons.getTotalElements(),
            listUserCommonDTO.size(), userCommons.getTotalPages(), listUserCommonDTO);
        httpStatus = HttpStatus.OK;
      } else {
        httpStatus = HttpStatus.NOT_FOUND;
        responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
            0L,
            0, new ArrayList<>());
      }
    } catch (Exception e) {
      httpStatus = HttpStatus.NOT_FOUND;
      responseObject = new ResponseObject(ERROR, NULL_CODE, FAILED,
          0L,
          0, new ArrayList<>());
      LOGGER.error("getListIntroducedUsers: ", e);
    }
    return new ResponseEntity(responseObject, httpStatus);
  }

  @Override
  public ResponseEntity<ResponseObject> getListIntroducedUsers(PageableModel pageableModel) {
    HttpStatus httpStatus;
    try {
      int page = pageableModel.getPage();
      int size = pageableModel.getSize();
      Pageable pageable = PageRequest.of(page - 1, size);
      List<Integer> roles = Arrays.asList(CANDIDATE_NUM, RECRUITER_NUM);
      String introPhone = cacheManagerService.getUser(tokenWrapper.getUid()).getPhone();
      System.out.println("introphone: " + introPhone);
      Page<UserCommon> userCommons = userCommonRepo.findIntroducedUsers(roles, introPhone,
          pageable);
//            List<UserCommon> userCommons = userCommonRepo.findIntroducedUsers(roles, introPhone);
      if (userCommons != null && Optional.of(userCommons).isPresent()) {
        List<UserCommonDTO> listUserCommonDTO = userCommons
            .stream()
            .map(this::buildUserCommonDTO).collect(Collectors.toList());
        responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
            userCommons.getTotalElements(),
            listUserCommonDTO.size(), userCommons.getTotalPages(), listUserCommonDTO);
        httpStatus = HttpStatus.OK;
      } else {
        httpStatus = HttpStatus.NOT_FOUND;
        responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
            0L,
            0, new ArrayList<>());
      }
    } catch (Exception e) {
      httpStatus = HttpStatus.NOT_FOUND;
      responseObject = new ResponseObject(ERROR, NULL_CODE, FAILED,
          0L,
          0, new ArrayList<>());
      LOGGER.error("getListIntroducedUsers: ", e);
    }
    return new ResponseEntity(responseObject, httpStatus);
  }

  @Override
  public ResponseEntity<ResponseObject> getStatisticalUser(LocalDateTime startDate,
      LocalDateTime endDate, List<Integer> roles) {
    HttpStatus httpStatus = null;
    StatisticalUser statisticalUser = userCommonRepo.statisticalUser(startDate, endDate, roles);
    if (statisticalUser != null) {
      responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
          0L,
          0, Arrays.asList(statisticalUser));
      httpStatus = HttpStatus.OK;
    } else {
      httpStatus = HttpStatus.NOT_FOUND;
      responseObject = new ResponseObject(NOT_FOUND, NOT_FOUND, FAILED,
          0L,
          0, new ArrayList<>());
    }
    return new ResponseEntity(responseObject, httpStatus);
  }

  @Override
  public ResponseEntity<RefreshTokenObject> getRefreshToken() {
    String uid = tokenWrapper.getUid().toString();
    String refreshToken = cacheService.getCache(cacheManager, TOKEN, REFRESH_TOKEN + uid);
    RefreshTokenObject refreshTokenContainer = RefreshTokenObject.builder()
        .refreshToken(refreshToken).build();
    return new ResponseEntity(refreshTokenContainer, HttpStatus.OK);
  }

  @Override
  public List<UserCommon> getUsersByRole(Integer role) {
    return userCommonRepo.findByRole(role);
  }

  @Override
  public ResponseEntity<ResponseObject> getTotalUserByRole(List<Integer> roles) {
    HttpStatus httpStatus;
    try {
      List<Integer> years = userCommonRepo.findDistinctYears();
      List<Object[]> results = userCommonRepo.countUsersByRoleAndYear(roles);
      List<Map<String, Long>> responseData = new ArrayList<>();
      Map<Integer, Map<String, Long>> roleDataMap = new HashMap<>();
      for (Integer role : roles) {
        roleDataMap.put(role, new HashMap<>());
      }
      for (Object[] result : results) {
        Integer role = (Integer) result[0];
        String year = String.valueOf(result[1]);
        Long count = (Long) result[2];
        roleDataMap.get(role).put(year, count);
      }
      for (Integer role : roles) {
        Map<String, Long> roleData = roleDataMap.get(role);
        for (Integer year : years) {
          roleData.computeIfAbsent(String.valueOf(year), k -> 0L);
        }
        responseData.add(roleData);
      }
      if (responseData.isEmpty()) {
        httpStatus = HttpStatus.NOT_FOUND;
        responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
            0L,
            0, new ArrayList<>());

      } else {
        httpStatus = HttpStatus.OK;
        responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
            0L,
            0, responseData);
      }
    } catch (Exception e) {
      httpStatus = HttpStatus.NOT_FOUND;
      responseObject = new ResponseObject(ERROR, NULL_CODE, FAILED,
          0L,
          0, new ArrayList<>());
      LOGGER.error("getTotalUserByRole: ", e);

    }
    return new ResponseEntity<>(responseObject, httpStatus);
  }

  public ResponseEntity<Map<String, Map<String, Long>>> compareJobCountsByYear() {
    try {
      List<Integer> jobYears = jobRepo.findDistinctYears();
      List<Integer> freelancerYears = freelancerRepo.findDistinctYears();
      Map<String, Map<String, Long>> responseData = new HashMap<>();
      responseData.put("common", new HashMap<>());
      responseData.put("freelancer", new HashMap<>());
      responseData.put("job", new HashMap<>());
      Map<Integer, Long> commonCounts = new HashMap<>();
      for (Integer year : jobYears) {
        responseData.get("common").put(String.valueOf(year), 0L);
        responseData.get("freelancer").put(String.valueOf(year), 0L);
        responseData.get("job").put(String.valueOf(year), 0L);
        commonCounts.put(year, 0L);
      }
      for (Integer year : freelancerYears) {
        if (!responseData.get("common").containsKey(String.valueOf(year))) {
          responseData.get("common").put(String.valueOf(year), 0L);
          responseData.get("freelancer").put(String.valueOf(year), 0L);
          responseData.get("job").put(String.valueOf(year), 0L);
          commonCounts.put(year, 0L);
        }
      }

      List<Object[]> jobResults = jobRepo.countJobsByYear();
      for (Object[] result : jobResults) {
        String year = String.valueOf(result[0]);
        Long count = (Long) result[1];
        responseData.get("job").put(year, count);
        commonCounts.put(Integer.valueOf(year),
            commonCounts.getOrDefault(Integer.valueOf(year), 0L) + count);
      }

      List<Object[]> freelancerResults = freelancerRepo.countFreelancersByYear();
      for (Object[] result : freelancerResults) {
        String year = String.valueOf(result[0]);
        Long count = (Long) result[1];
        responseData.get("freelancer").put(year, count);
        commonCounts.put(Integer.valueOf(year),
            commonCounts.getOrDefault(Integer.valueOf(year), 0L) + count);
      }

      for (Map.Entry<Integer, Long> entry : commonCounts.entrySet()) {
        responseData.get("common").put(String.valueOf(entry.getKey()), entry.getValue());
      }

      System.out.println("Response data (by year): " + responseData);
      return new ResponseEntity<>(responseData, HttpStatus.OK);
    } catch (Exception e) {
      System.err.println("compareJobCountsByYear error: " + e.getMessage());
      e.printStackTrace();
      return new ResponseEntity<>(new HashMap<>(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public ResponseEntity<Map<String, Object>> compareJobCounts(YearRequest yearRequest) {
    try {
      int inputYear = yearRequest.getInputYear();
      System.out.println("Processing compareJobCounts for year: " + inputYear);
      List<Object[]> jobResults = jobRepo.countJobsByMonth(inputYear);
      List<Object[]> freelancerResults = freelancerRepo.countFreelancersByMonth(inputYear);

      Map<String, Object> responseData = new HashMap<>();
      Map<String, Long> commonData = new HashMap<>();
      Map<String, Long> freelancerData = new HashMap<>();
      Map<String, Long> jobData = new HashMap<>();

      for (int month = 1; month <= 12; month++) {
        commonData.put(String.valueOf(month), 0L);
        freelancerData.put(String.valueOf(month), 0L);
        jobData.put(String.valueOf(month), 0L);
      }

      for (Object[] result : jobResults) {
        String month = String.valueOf(result[0]);
        Long count = (Long) result[1];
        jobData.put(month, count);
        commonData.put(month, commonData.get(month) + count);
      }

      for (Object[] result : freelancerResults) {
        String month = String.valueOf(result[0]);
        Long count = (Long) result[1];
        freelancerData.put(month, count);
        commonData.put(month, commonData.get(month) + count);
      }

      responseData.put("common", commonData);
      responseData.put("freelancer", freelancerData);
      responseData.put("job", jobData);

      System.out.println("Response data (by month): " + responseData);
      return new ResponseEntity<>(Map.of("data", responseData), HttpStatus.OK);
    } catch (Exception e) {
      System.err.println("compareJobCounts error: " + e.getMessage());
      e.printStackTrace();
      return new ResponseEntity<>(Map.of("data", new HashMap<>()),
          HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Override
  public ResponseEntity<String> updatePremiumUser(Long fee, Integer months) throws Throwable {
    ResponseObject response = paymentFeignClient.getCurrentUserWallet();
    WalletDTO wallet = mapper.convertValue(response.getData(), WalletDTO.class);
    Long currentBalance = wallet.getTotalMoney();

    UserCommon user = (UserCommon) userCommonRepo.findById(wallet.getUserId())
        .orElseThrow(() -> new BadRequestException("Không tìm thấy user"));

    if (user.getIsPremium() && user.getPremiumExpDate().isAfter(LocalDateTime.now())) {
      return ResponseEntity
          .status(HttpStatus.BAD_REQUEST)
          .body("User đang là premium");
    }

    if (currentBalance.compareTo(fee) < 0) {
      return ResponseEntity
          .status(HttpStatus.BAD_REQUEST)
          .body("Số dư trong ví không đủ! Vui lòng nạp thêm");
    } else {
      user.setIsPremium(true);

      LocalDateTime expiredAt = LocalDateTime.now().plusMonths(months);
      user.setPremiumExpDate(expiredAt);

      userCommonRepo.save(user);

      Long newBalance = currentBalance - fee;
      wallet.setTotalMoney(newBalance);

      paymentFeignClient.updateWallet(wallet);
      return ResponseEntity
          .ok("Nâng cấp Premium thành công!");
    }
  }

  @Override
  public Map<Long, String> getUserEmail() {
    List<Object[]> results = userCommonRepo.getAllUserEmails();
    return results.stream()
        .collect(Collectors.toMap(
            row -> (Long) row[0],
            row -> (String) row[1]
        ));
  }

  @Service
  public class PremiumScheduler {

    @Scheduled(cron = "0 0 0 * * *")
    public void checkAndExpirePremium() {
      LocalDateTime now = LocalDateTime.now();

      List<UserCommon> expiredUsers = userCommonRepo.findExpiredUsers(now);

      if (!expiredUsers.isEmpty()) {
        expiredUsers.forEach(u -> {
          u.setPremiumExpDate(null);
          u.setIsPremium(false);
        });
        userCommonRepo.saveAll(expiredUsers);
      }
    }
  }
}
