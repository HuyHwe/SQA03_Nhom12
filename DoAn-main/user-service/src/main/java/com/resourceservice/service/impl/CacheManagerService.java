package com.resourceservice.service.impl;

import com.resourceservice.dto.UserCommonDTO;
import com.resourceservice.service.UserCommonService;
import com.resourceservice.utilsmodule.CacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import static com.resourceservice.utilsmodule.constant.Constant.USER;

@Service
public class CacheManagerService {
    @Autowired
    private CacheService cacheService;
    @Autowired
    private UserCommonService userCommonService;
    @Autowired
    private org.springframework.cache.CacheManager cacheManager;
    public UserCommonDTO getUser(Long uid) {
        final String cacheKey = USER + uid;
        UserCommonDTO userCommonDTO = cacheService.getCache(cacheManager, USER, cacheKey);
        return userCommonDTO;
    }
    public UserCommonDTO adminGetUser(Long uid) {
        final String cacheKey = USER + uid;
        UserCommonDTO userCommonDTO = cacheService.getCache(cacheManager, USER, cacheKey);
        return userCommonDTO;
    }
}
