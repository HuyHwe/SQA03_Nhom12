package com.resourceservice.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.jober.utilsservice.constant.Constant;
import com.jober.utilsservice.dto.WalletDTO;
import com.jober.utilsservice.dto.WalletResDTO;
import com.jober.utilsservice.utils.HttpUtils;
import com.resourceservice.config.EnvProperties;
import com.resourceservice.utilsmodule.CacheService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

import static com.jober.utilsservice.constant.APIConstant.*;
import static com.jober.utilsservice.constant.Constant.DATA;
import static com.jober.utilsservice.constant.Constant.ID;
import static com.resourceservice.utilsmodule.constant.Constant.*;

@Service
public class CommunityService {
    @Autowired
    private EnvProperties envProperties;
    @Autowired
    private CacheService cacheService;
    @Autowired
    private CacheManager cacheManager;

    public static Logger LOGGER = LoggerFactory.getLogger(CommunityService.class);

    public Map<String, Object> getOrganization(Long orgId) {
        Map<String, Object> uriVariables = new HashMap<>();
        uriVariables.put(ID, orgId);
        String uri = envProperties.getSearchServiceURI() + BS_SEARCH_ORG_BY_ID + "?id={id}";
        ResponseEntity responseEntity = HttpUtils.getData(uriVariables, null, uri, null);
        Map<String, Object> result;
        try {
            result = OBJECT_MAPPER.readValue(responseEntity.getBody().toString(), Map.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        return result;
    }

    public Map<String, Object> saveWallet(WalletDTO walletDTO) {
        String uri = envProperties.getPaymentServiceURI() + BS_PAYMENT_SAVE_WALLET;
        LOGGER.info("saveWallet uri: " + uri);
        try {
            LOGGER.info("saveWallet walletDTO: " + OBJECT_MAPPER.writeValueAsString(walletDTO));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        ResponseEntity responseEntity = HttpUtils.postData(walletDTO, null, uri);
        Map<String, Object> result;
        try {
            LOGGER.info("saveWallet responseEntity output save: " + responseEntity);

            result = OBJECT_MAPPER.readValue(responseEntity.getBody().toString(), Map.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        return result;
    }

    public WalletResDTO getWalletByUser(Long userId) {
        Map<String, Object> uriVariables = new HashMap<>();
        uriVariables.put(Constant.USER_ID, userId);
        String uri = envProperties.getPaymentServiceURI() + BS_PAYMENT_GET_WALLET_BY_USER + "?userId={userId}";
//        String token = cacheService.getCache(cacheManager, TOKEN, ACCESS_TOKEN);
        ResponseEntity responseEntity = HttpUtils.getData(uriVariables, null, uri, null);
        WalletResDTO result = null;
        try {
            Map<String, Object> map = OBJECT_MAPPER.readValue(responseEntity.getBody().toString(), Map.class);
            Map<String, Object> data = (Map<String, Object>) map.get(DATA);
            result = OBJECT_MAPPER.convertValue(data, WalletResDTO.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        } finally {
           return result;
        }
    }
}
