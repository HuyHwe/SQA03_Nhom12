package com.resourceservice.utilsmodule.utils;

import com.jober.utilsservice.utils.modelCustom.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import static com.resourceservice.utilsmodule.constant.Constant.*;

@Slf4j
public class Utility {
    public static ResponseObject responseObject = new ResponseObject();
    public static String getContent(String type, String pass, String toPhoneNumber, String contactPhoneNum) {
        String content = null;
        switch (type) {
            case SENT_PASSWORD:
                content = pass + " la mat khau cua so dien thoai " + toPhoneNumber + " tren www.jober.com.vn, trang tuyen dung, tim viec lam theo ban do so 1 Viet Nam. Lien he: " + contactPhoneNum;
                break;
        }
        return content;
    }
    public static boolean isSendSMS(String content, String toPhoneNumber, String contactPhoneNum) {
        String apiKey = "EA92CAF8610EFA031DB68D75A9C5FE";
        String secretKey = "4D05FFEE7A6C823D67C89F7348C343";
        String isUnicode = "0";
        String brandName = "JOBER";
        String smsType = "2";

        String lblApiKey = "ApiKey";
        String lblSecretKey = "SecretKey";
        String lblPhone = "Phone";
        String lblContent = "Content";
        String lblIsUnicode = "IsUnicode";
        String lblBrandname = "Brandname";
        String lblSmsType = "SmsType";

        String uri = "http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get";
        String urlTemplate = UriComponentsBuilder.fromHttpUrl(uri)
                .queryParam(lblApiKey, "{ApiKey}")
                .queryParam(lblSecretKey, "{SecretKey}")
                .queryParam(lblPhone, "{Phone}")
                .queryParam(lblContent, "{Content}")
                .queryParam(lblIsUnicode, "{IsUnicode}")
                .queryParam(lblBrandname, "{Brandname}")
                .queryParam(lblSmsType, "{SmsType}")
                .encode()
                .toUriString();
        Map<String, Object> map = new HashMap<>();
        map.put(lblApiKey, apiKey);
        map.put(lblSecretKey, secretKey);
        map.put(lblPhone, toPhoneNumber);
        map.put(lblContent, content);
        map.put(lblIsUnicode, isUnicode);
        map.put(lblBrandname, brandName);
        map.put(lblSmsType, smsType);

        try {
            ResponseEntity responseEntity = HttpUtils.getData(map, null, urlTemplate);
            if (responseEntity.getStatusCode() == HttpStatus.OK) {
                log.info("Send message is success");
                return true;
            }
        } catch (NullPointerException e) {
            log.info("Send message is failed");
        }
        return false;
    }
    public static int generatePin() {
        int min = 100000;
        int max = 999999;
        Random random = new Random();
        int pin = random.nextInt(max - min) + min;
        return pin;
    }

    public static ResponseObject responseObject(String status, String code, String message, Object data) {
        if (status != null) responseObject.setStatus(status);
        if (code != null) responseObject.setCode(code);
        if (data != null) responseObject.setData(data);
        if (message != null) responseObject.setMessage(message);
        return responseObject;
    }

    public static SearchInput buildSearchInput(String body) {
        SearchInput searchInput = new SearchInput();
        try {
            Map<String, Object> map = OBJECT_MAPPER.readValue(body, Map.class);
            Filter filter = null;
            List<SortItem> sortItems = null;
            Paging paging = null;
            if (map.containsKey(FILTER)) {
                filter = new Filter();
                Map<String, Object> mapFilter = (Map<String, Object>) map.get(FILTER);
                if (mapFilter.containsKey(MATCHING_AND)) {
                    filter.setMatchingAnd((Map<String, List<String>>) mapFilter.get(MATCHING_AND));
                }
                if (mapFilter.containsKey(MATCHING_OR)) {
                    filter.setMatchingOr((Map<String, List<String>>) mapFilter.get(MATCHING_OR));
                }
            }
            if (map.containsKey(SORT)) {
                sortItems =  (List<SortItem>) map.get(SORT);
            }
            if (map.containsKey(PAGING)) {
                Map<String, Object> mapPage = (Map<String, Object>) map.get(PAGING);
                paging = new Paging((Integer) mapPage.get(PAGE), (Integer) mapPage.get(SIZE));
            }
            searchInput.setFetch((List<String>) map.get(FETCH));
            searchInput.setFilter(filter);
            searchInput.setSortItems(sortItems);
            searchInput.setPaging(paging);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return searchInput;
    }
}
