package com.resourceservice.threadpool;

import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.model.Freelancer;
import com.resourceservice.model.UserCommon;
import com.resourceservice.repository.FreelancerRepo;
import com.resourceservice.service.UserCommonService;

import java.util.concurrent.Callable;

import static com.jober.utilsservice.constant.Constant.SUCCESS_CODE;
import static com.jober.utilsservice.constant.ResponseMessageConstant.*;

public class CallableFreelancer implements Callable<ResponseObject> {
    private FreelancerRepo freelancerRepo;
    private Freelancer freelancer;
    public CallableFreelancer(Freelancer freelancer, FreelancerRepo freelancerRepo) {
        this.freelancer = freelancer;
        this.freelancerRepo = freelancerRepo;
    }
    @Override
    public ResponseObject call() {
        Freelancer freelancer1 = (Freelancer) this.freelancerRepo.save(freelancer);
        if (freelancer1 != null) {
            return new ResponseObject(SUCCESS, SUCCESS_CODE, SUCCESS);
        } else {
            return new ResponseObject(FAILED, null, NOT_UPDATED);
        }
    }
}