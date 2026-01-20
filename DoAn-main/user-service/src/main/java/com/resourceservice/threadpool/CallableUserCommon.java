package com.resourceservice.threadpool;

import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.dto.UserCommonDTO;
import com.resourceservice.model.UserCommon;
import com.resourceservice.repository.UserCommonRepo;
import com.resourceservice.service.UserCommonService;
import com.resourceservice.service.impl.UserCommonServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.concurrent.Callable;

import static com.resourceservice.utilsmodule.constant.Constant.OBJECT_MAPPER;

public class CallableUserCommon implements Callable<ResponseObject> {
    private UserCommonService userCommonService;
    private UserCommonDTO userCommonDTO;
    public CallableUserCommon(UserCommonDTO userCommonDTO, UserCommonService userCommonService) {
        this.userCommonDTO = userCommonDTO;
        this.userCommonService = userCommonService;
    }
    @Override
    public ResponseObject call() throws Exception {
        String body = OBJECT_MAPPER.writeValueAsString(this.userCommonDTO);
        return userCommonService.createUser(body);
    }
}
