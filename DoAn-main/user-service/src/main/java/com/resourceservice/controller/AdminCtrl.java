package com.resourceservice.controller;

import com.jober.utilsservice.model.PageableModel;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.common.CommonUtils;
import com.resourceservice.dto.*;
import com.resourceservice.dto.request.IntroducedUsersRequest;
import com.resourceservice.dto.request.UserParamDTO;
import com.resourceservice.model.Job;
import com.resourceservice.service.AdminService;
import com.resourceservice.service.UserCommonService;
import com.resourceservice.service.impl.JobServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("bs-admin")
public class AdminCtrl {
    @Autowired
    private AdminService adminService;
    @Autowired
    private JobServiceImpl jobService;
    @Autowired
    private CommonUtils utils;
    @Autowired
    private UserCommonService userCommonService;

    @RequestMapping(method = RequestMethod.POST, value = "/_delete")
    public ResponseEntity<Response> deleteUser(@RequestBody List<Long> ids) {
        return adminService.deleteUser(ids);
    }
    /**
     * Đăng tuyển mới nhat
     * @return
     */
    @RequestMapping(method = RequestMethod.POST, value = "/latestRecruiter")
    public ResponseEntity<ResponseObject> latestRecruiter(@RequestBody PageableModel pageableModel) {
        return adminService.latestRecruiter(pageableModel);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/update-job")
    public ResponseEntity<ResponseObject> updateJob(@RequestBody Job job) {
        return adminService.updateJob(job);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/deleteFreelancerByIds")
    public ResponseEntity<ResponseObject> deleteFreelancerByIds(@RequestBody List<Long> freelancerIds) {
        return adminService.deleteFreelancerByIds(freelancerIds);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/latestFreelancer")
    public ResponseEntity<ResponseObject> latestFreelancer(@RequestBody FreelancerDTO freelancerDTO) {
        return adminService.latestFreelancer(freelancerDTO);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/updateFreelancerById")
    public ResponseEntity<ResponseObject> updateFreelancerById(@RequestBody FreelancerDTO freelancerDTO) {
        return adminService.updateFreelancerById(freelancerDTO);
    }
    @RequestMapping(method = RequestMethod.POST, value = "/getListUsers")
    public ResponseEntity<ResponseObject> getListUsers(@RequestBody UserParamDTO userParamDTO) {
        return adminService.getListUsers(userParamDTO);
    }
    @RequestMapping(method = RequestMethod.POST, value = "/getBlockedUsers")
    public ResponseEntity<ResponseObject> getBlockedUsers(@RequestBody UserCommonDTO userCommonDTO) {
        return adminService.getBlockedUsers(userCommonDTO);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/statisticalUserByTime")
    public ResponseEntity<ResponseObject> statisticalUserByTime(@RequestBody UserCommonDTO userCommonDTO) {
        return adminService.statisticalUserByTime(userCommonDTO);
    }
    @RequestMapping(method = RequestMethod.POST, value = "/revenueInRealtime")
    public ResponseEntity<ResponseObject> revenueInRealtime() {
        return adminService.revenueInRealtime();
    }
    @RequestMapping(method = RequestMethod.POST, value = "/statisticalRevenueByTime")
    public ResponseEntity<ResponseObject> statisticalRevenueByTime(@RequestBody PaymentDTO paymentDTO) {
        return adminService.statisticalRevenueByTime(paymentDTO);
    }
    @RequestMapping(method = RequestMethod.POST, value = "/bonusForUser")
    public ResponseEntity<ResponseObject> bonusForUser(@RequestBody BonusDTO bonusDTO) {
        return adminService.bonusForUser(bonusDTO);
    }
    @RequestMapping(method = RequestMethod.POST, value = "/updateBonusForUser")
    public ResponseEntity<ResponseObject> updateBonusForUser(@RequestBody BonusDTO bonusDTO) {
        return adminService.updateBonusForUser(bonusDTO);
    }
    @RequestMapping(method = RequestMethod.POST, value = "/scanUser")
    public ResponseEntity<Response> scanUser(@RequestParam("file") MultipartFile file, @RequestParam String scanObject) {
//        file.getSize();
        return adminService.scanUser(scanObject, file);
    }
    @RequestMapping(method = RequestMethod.POST, value = "/delete-job")
    public ResponseEntity<ResponseObject> deleteJob(@RequestBody List<Long> ids) {
        return jobService.deleteJobByIds(ids);
    }
    @RequestMapping(method = RequestMethod.POST, value = "/introduced-users")
    public ResponseEntity<ResponseObject> getListIntroducedUsers(@RequestBody IntroducedUsersRequest introducedUsersRequest) {
        return userCommonService.adminGetListIntroducedUsers(introducedUsersRequest);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/login")
    public ResponseEntity<?> login(@RequestBody InputLoginDTO body) {
        ResponseEntity responseEntity = userCommonService.adminLogin(body);
        return responseEntity;
    }



    @PostMapping("/upload")
    public ResponseEntity<List<String>> uploadFiles(@RequestParam MultipartFile file) {
        List<String> filenames = new ArrayList<>();
        String filename = StringUtils.cleanPath(file.getOriginalFilename());

        return ResponseEntity.ok().body(filenames);
    }

    @PostMapping(value ="/_upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadData(@RequestBody MultipartFile file) throws Exception {
        if (file == null) {
            throw new RuntimeException("You must select the a file for uploading");
        }
        InputStream inputStream = file.getInputStream();
        String originalName = file.getOriginalFilename();
        String name = file.getName();
        String contentType = file.getContentType();
        long size = file.getSize();
        // Do processing with uploaded file data in Service layer
        return new ResponseEntity<String>(originalName, HttpStatus.OK);
    }
    @RequestMapping(method = RequestMethod.GET, value = "/convertAddressToCoordinate")
    public Map<String, Double> convertAddressToCoordinate(@RequestBody String address) {
        Map<String, Double> coordinateMap = utils.convertAddressToCoordinate(address);
        return coordinateMap;
    }

    // Define a method to download files
    @GetMapping("/download_template_freelancer")
    public ResponseEntity<byte[]> downloadTemplateFreelancer() throws IOException, URISyntaxException {
        String fileName = "templates/template_freelancer.xlsx";
        File file = this.getFileFromResource(fileName);
        byte[] content = Files.readAllBytes(file.toPath());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDisposition(ContentDisposition.builder("attachment").filename(file.getName()).build());
        return new ResponseEntity<>(content, headers, HttpStatus.OK);
    }

    /*
        The resource URL is not working in the JAR
        If we try to access a file that is inside a JAR,
        It throws NoSuchFileException (linux), InvalidPathException (Windows)

        Resource URL Sample: file:java-io.jar!/json/file1.json
     */
    private File getFileFromResource(String fileName) throws URISyntaxException {

        ClassLoader classLoader = getClass().getClassLoader();
        URL resource = classLoader.getResource(fileName);
        if (resource == null) {
            throw new IllegalArgumentException("file not found! " + fileName);
        } else {
            // failed if files have whitespaces or special characters
            //return new File(resource.getFile());
            return new File(resource.toURI());
        }

    }
}
