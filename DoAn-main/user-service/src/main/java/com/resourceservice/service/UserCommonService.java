package com.resourceservice.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.jober.utilsservice.model.PageableModel;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.dto.*;
import com.resourceservice.dto.request.IntroducedUsersRequest;
import com.resourceservice.dto.request.UserForChangingPass;
import com.resourceservice.dto.request.UserParamDTO;
import com.resourceservice.dto.request.YearRequest;
import com.resourceservice.model.RefreshTokenObject;
import com.resourceservice.model.UserCommon;
import java.math.BigDecimal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface UserCommonService {
    ResponseEntity getListRecruiterManagementByUserId(Long userId);

    ResponseObject findUserByPhoneNumber(UserParamDTO userParamDTO);

    ResponseObject createUser(String body);

    ResponseObject saveUser(String body);
    ResponseObject forgetPassword(UserForChangingPass param);

    ResponseEntity getListAdmin(String body);

    ResponseEntity obtainAccessToken(InputGetTokenDTO body);

    ResponseEntity saveOrUpdateAvatar(Long userId, MultipartFile file);

    ResponseEntity logout();

    ResponseEntity login(InputLoginDTO inputLoginDTO);

    ResponseEntity adminLogin(InputLoginDTO inputLoginDTO);

    OidcUser processUserOidc(String registrationId, Map<String, Object> attributes, OidcUser oidcUser);

    OAuth2User processUserOAuth2(String registrationId, Map<String, Object> attributes, OAuth2User oidcUser);
    OAuth2User processUserOAuth2(GoogleIdToken.Payload payload);

    UserCommon createNewOne(UserCommon userCommon);
    ResponseEntity<?> getUserInfo(String username);

    ResponseEntity updateInforUser(Long userId, UserInforDto userInforDto);

    ResponseEntity getListIntroducedUsers(PageableModel pageableModel);
    ResponseEntity<ResponseObject> adminGetListIntroducedUsers(IntroducedUsersRequest introducedUsersRequest);

    ResponseEntity getStatisticalUser(LocalDateTime startDate, LocalDateTime endDate, List<Integer> roles);
    ResponseEntity<Map<String, Map<String, Long>>> compareJobCountsByYear();
    ResponseEntity<RefreshTokenObject> getRefreshToken();
    ResponseEntity<ResponseObject> getTotalUserByRole(List<Integer> roles);
    List<UserCommon> getUsersByRole(Integer role);
    ResponseEntity<Map<String, Object>> compareJobCounts(YearRequest yearRequest);
    ResponseEntity<String> updatePremiumUser(Long fee, Integer months) throws Throwable;

    Map<Long, String> getUserEmail();

}
