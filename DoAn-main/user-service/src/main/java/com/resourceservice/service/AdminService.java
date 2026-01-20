package com.resourceservice.service;

import com.jober.utilsservice.model.PageableModel;
import com.resourceservice.dto.*;
import com.resourceservice.dto.request.UserParamDTO;
import com.resourceservice.model.Job;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AdminService {
    ResponseEntity deleteUser(List<Long> ids);
    ResponseEntity latestRecruiter(PageableModel pageableModel);
    ResponseEntity latestFreelancer(FreelancerDTO freelancerDTO);
    ResponseEntity updateJob(Job Job);
    ResponseEntity deleteFreelancerByIds(List<Long> freelancerIds);
    ResponseEntity updateFreelancerById(FreelancerDTO freelancerDTO);
    ResponseEntity getListUsers(UserParamDTO userParamDTO);
    ResponseEntity getBlockedUsers(UserCommonDTO userCommonDTO);
//       Statistic users in a specific time
    ResponseEntity statisticalUserByTime(UserCommonDTO userCommonDTO);
    ResponseEntity revenueInRealtime();
    ResponseEntity statisticalRevenueByTime(PaymentDTO paymentDTO);
    ResponseEntity bonusForUser(BonusDTO bonusDTO);
    ResponseEntity updateBonusForUser(BonusDTO bonusDTO);
    ResponseEntity scanUser(String scanObject, MultipartFile file);
    /*ResponseEntity getCorrespondingJobs(PageableModel pageableModel);
//    Update status in freelancer table
    ResponseEntity activeStatusForFreelancer(PageableModel pageableModel);
//    Delete record in freelancer
    ResponseEntity deleteFreelancer(PageableModel pageableModel);
//    include freelancer or recruiter
    ResponseEntity getListUsers(PageableModel pageableModel);
    ResponseEntity addingNewUser(PageableModel pageableModel);
    ResponseEntity updateUser(PageableModel pageableModel);
//    thống kê người dùng theo tháng/năm...
    ResponseEntity statisticalUserInSpecificTime(PageableModel pageableModel);
//    cho phép đọc dữ liệu từ file & ghi vào db
    ResponseEntity scanUser(PageableModel pageableModel);
//    Doanh thu theo thời gian thực
    ResponseEntity revenueInRealtime(PageableModel pageableModel);
    ResponseEntity bonusForUser(PageableModel pageableModel);*/

}
