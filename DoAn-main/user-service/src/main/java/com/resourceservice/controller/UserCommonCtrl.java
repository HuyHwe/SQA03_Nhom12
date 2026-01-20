package com.resourceservice.controller;


import com.amazonaws.services.apigateway.model.BadRequestException;
import com.jober.utilsservice.constant.Constant;
import com.jober.utilsservice.model.PageableModel;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.config.EnvProperties;
import com.resourceservice.dto.InputLoginDTO;
import com.resourceservice.dto.UserInforDto;
import com.resourceservice.dto.request.*;
import com.resourceservice.model.RefreshTokenObject;
import com.resourceservice.model.UserCommon;
import com.resourceservice.service.FacebookService;
import com.resourceservice.service.FreelancerService;
import com.resourceservice.service.UserCommonService;
import com.resourceservice.service.impl.S3ServiceImpl;
import com.resourceservice.utilsmodule.utils.CustomOAuth2UserService;
import java.math.BigDecimal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException.Unauthorized;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.jober.utilsservice.constant.Constant.*;
import static com.jober.utilsservice.constant.ResponseMessageConstant.SUCCESS;

@RestController
@RequestMapping("bs-user")
public class UserCommonCtrl {
    @Autowired
    private UserCommonService userCommonService;

    @Autowired
    private S3ServiceImpl s3Service;

    @Autowired
    private EnvProperties envProperties;

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    private FacebookService facebookService;
    @Autowired
    private FreelancerService freelancerService;
    public static Logger LOGGER = LoggerFactory.getLogger(S3ServiceImpl.class);
    @PostMapping("/user_common/_search")
    public ResponseObject searchUsers(@RequestBody UserParamDTO userParamDTO) {
        ResponseObject responseObject = userCommonService.findUserByPhoneNumber(userParamDTO);
        return responseObject;
    }

    @RequestMapping(method = RequestMethod.GET, value = "/user_common/profile")
    public ResponseEntity<ResponseObject> getRecruiterRate(@RequestParam(name = "userId") Long userId) {
        ResponseEntity responseEntity = userCommonService.getListRecruiterManagementByUserId(userId);
        return responseEntity;
    }

    @GetMapping("/user_common/user-info")
    public ResponseEntity<?> getUserInfo(Authentication authentication, Principal principal) {
        return userCommonService.getUserInfo(authentication.getName());
    }

    @RequestMapping(method = RequestMethod.POST, value = "/user_common/_create")
    public ResponseObject createUser(@RequestBody String body) {
        ResponseObject responseObject = userCommonService.createUser(body);
        return responseObject;
    }

    @RequestMapping(method = RequestMethod.POST, value = "/user_common/_update")
    public ResponseObject updateUser(@RequestBody String body) {
        ResponseObject responseObject = userCommonService.saveUser(body);
        return responseObject;
    }

    @RequestMapping(method = RequestMethod.POST, value = "/user_common/_change_pass")
    public ResponseObject changePass(@RequestBody String body) {
        ResponseObject responseObject = userCommonService.saveUser(body);
        return responseObject;
    }

    @RequestMapping(method = RequestMethod.POST, value = "/user_common/_forget_pass")
    public ResponseObject forgetPass(@RequestBody UserForChangingPass body) {
        ResponseObject responseObject = userCommonService.forgetPassword(body);
        return responseObject;
    }

    @RequestMapping(method = RequestMethod.POST, value = "/list_admin")
    public ResponseEntity<?> getListAdmin(@RequestBody String body) {
        return userCommonService.getListAdmin(body);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/login")
    public ResponseEntity<?> login(@RequestBody InputLoginDTO body) {
        ResponseEntity responseEntity = userCommonService.login(body);
        return responseEntity;
    }

    @RequestMapping(method = RequestMethod.POST, value = "/refresh-token")
    public ResponseEntity<RefreshTokenObject> getRefreshToken() {
        ResponseEntity responseEntity = userCommonService.getRefreshToken();
        return responseEntity;
    }

    @PostMapping("/mobile/google-login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String idTokenString = body.get("idToken");
        try {
            OAuth2User oAuth2User = customOAuth2UserService.loadUserFromIdToken(idTokenString);
            return ResponseEntity.ok(oAuth2User.getAttributes());
        } catch (OAuth2AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid ID token");
        }
    }
    @PostMapping("/mobile/facebook-login")
    public ResponseEntity<?> facebookLogin(@RequestBody Map<String, String> body) {
        String accessToken = body.get("accessToken");
        try {
            Map<String, Object> userAttributes = facebookService.verifyTokenAndGetUser(accessToken);
            return ResponseEntity.ok(userAttributes);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
    }

    @GetMapping(value = "/images/avatar/{id}")
    public ResponseEntity<byte[]> getFile(@PathVariable("id") Long userId, HttpServletResponse response) throws IOException {

        byte[] bytes = s3Service.getFile(userId);

        if (bytes.length == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        //for download
//        String filename = "testName.jpg";
//        String headerKey = "Content-Disposition";
//        String headerValue = String.format("form-data; filename=\"%s\"", filename);
//        response.setHeader(headerKey, headerValue);
        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG)
                .body(bytes);
    }

    @PostMapping("/images/avatar/{id}")
    public ResponseEntity<ResponseObject> uploadFile(@PathVariable("id") Long userId, @RequestParam("file") MultipartFile file) {
        return userCommonService.saveOrUpdateAvatar(userId, file);
    }

    //Thay đổi thông tin
    @PutMapping(value = "/user/{id}",
            consumes = {"multipart/form-data"})
    public ResponseEntity<ResponseObject> updateInfor(@PathVariable("id") Long userId, @ModelAttribute UserInforDto userInforDto) {
        return userCommonService.updateInforUser(userId, userInforDto);
    }
    @RequestMapping(method = RequestMethod.GET, value = "/user_common/logout")
    public ResponseEntity logout() {
        return userCommonService.logout();
    }

    @RequestMapping(method = RequestMethod.POST, value = "/introduced-users")
    public ResponseEntity<ResponseObject> getListIntroducedUsers(@RequestBody PageableModel pageableModel) {
        return userCommonService.getListIntroducedUsers(pageableModel);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/statistical-users")
    public ResponseEntity<ResponseObject> getStatisticalUsers(@RequestParam("startDate")
                                                     @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                                     LocalDateTime startDate,
                                                 @RequestParam("endDate")
                                                     @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                                 LocalDateTime endDate,
                                                 @RequestParam("roles")
                                                 List<Integer> roles) {
        return userCommonService.getStatisticalUser(startDate, endDate, roles);
    }
    @PostMapping("/upload")
    public ResponseEntity<Response> handleFileUpload(@RequestParam("file") MultipartFile file) {
        Response response = null;
        try {
            // Define the path to the resources folder
//            String uploadDirectory = "/tmp/files/";
            String uploadDirectory = envProperties.getFileServerPath();
            LOGGER.info("download fileName & uploadDirectory ", file.getOriginalFilename(), uploadDirectory);
            // Get the file bytes
            byte[] bytes = file.getBytes();
//            PDFTextLocator.findAndCoverPdf(bytes, Constant.regexList(),uploadDirectory+"private-"+file.getOriginalFilename());
            // Define the path for the new file
            Path path = Paths.get(uploadDirectory + file.getOriginalFilename());
            // Write the file to the specified path
            Files.write(path, bytes);
            System.out.println("File uploaded successfully!");
            response = new Response(SUCCESS, SUCCESS_CODE, "File uploaded successfully!");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            response = new Response(ERROR, FAILED, "Failed to upload file!");
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PostMapping("/getTotalUserByRole")
    public ResponseEntity<ResponseObject> getTotalUserByRole( @RequestBody RoleRequest roleRequest) {
        List<Integer> roles = roleRequest.getRole();
        return userCommonService.getTotalUserByRole(roles);
    }
    @GetMapping("/bs-job/compareJobCountsByYear")
    public ResponseEntity<Map<String, Map<String, Long>>> compareJobCountsByYear() {
        return userCommonService.compareJobCountsByYear();
    }
    @PostMapping("/bs-job/compareJobCounts")
    public ResponseEntity<Map<String, Object>> compareJobCounts(@RequestBody YearRequest yearRequest){
        return userCommonService.compareJobCounts(yearRequest);
    }
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserCommon>> getUsersByRole(@PathVariable Integer role) {
        List<UserCommon> users = userCommonService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }
    @PostMapping("/delete-cv")
    public ResponseEntity<?> deleteCV(@RequestBody Map<String, Object> request) {
        try {
            Object userIdObj = request.get("userId");
            Long userId;

            // Xử lý userId có thể là String hoặc Integer
            if (userIdObj instanceof String) {
                userId = Long.valueOf((String) userIdObj);
            } else if (userIdObj instanceof Integer) {
                userId = ((Integer) userIdObj).longValue();
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "userId phải là chuỗi hoặc số"));
            }

            if (userId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "userId không được để trống"));
            }

            // Lấy danh sách cvNames
            @SuppressWarnings("unchecked")
            List<String> cvNames = (List<String>) request.get("cvNames");

            if (cvNames == null || cvNames.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Danh sách cvNames rỗng"));
            }

            // Loại bỏ các giá trị null trong cvNames
            cvNames = cvNames.stream().filter(name -> name != null).collect(Collectors.toList());
            if (cvNames.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Danh sách cvNames không chứa giá trị hợp lệ"));
            }

            freelancerService.deleteCVsByUserIdAndCvNames(userId, cvNames);
            return ResponseEntity.ok(Map.of("message", "Xóa CV thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

  // Controller
  @PostMapping("/_update")
  public ResponseEntity<?> updateUser(
      @RequestParam(name = "amount") Long amount,
      @RequestParam(name = "months") Integer months) throws Throwable {
    try {
      userCommonService.updatePremiumUser(amount, months);
      return ResponseEntity.ok(userCommonService.updatePremiumUser(amount, months));
    } catch (BadRequestException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }


}
