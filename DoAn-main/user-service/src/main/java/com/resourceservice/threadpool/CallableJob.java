package com.resourceservice.threadpool;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.model.Job;
import com.resourceservice.repository.JobRepo;
import com.resourceservice.service.JobService;
import java.util.concurrent.Callable;

import static com.jober.utilsservice.constant.Constant.SUCCESS_CODE;
import static com.jober.utilsservice.constant.ResponseMessageConstant.*;

public class CallableJob implements Callable<ResponseObject> {
    private JobRepo jobRepo;
    private Job job;
    public CallableJob(Job job, JobRepo jobRepo) {
        this.job = job;
        this.jobRepo = jobRepo;
    }
    @Override
    public ResponseObject call() {
        Job job1 = (Job) this.jobRepo.save(job);
        if (job1 != null) {
            return new ResponseObject(SUCCESS, SUCCESS_CODE, SUCCESS);
        } else {
            return new ResponseObject(FAILED, null, NOT_UPDATED);
        }
    }
}
