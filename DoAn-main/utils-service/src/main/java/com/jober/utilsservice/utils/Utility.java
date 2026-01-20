package com.jober.utilsservice.utils;

import com.jober.utilsservice.utils.modelCustom.*;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.util.UriComponentsBuilder;

import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import static com.jober.utilsservice.constant.Constant.*;

@Slf4j
public class Utility {
    private static final Logger LOGGER = LoggerFactory.getLogger(Utility.class);
    public static ResponseObject responseObject = new ResponseObject();
    public static String getContent(String type, String pass, String toPhoneNumber, String contactPhoneNum) {
        String content = null;
        switch (type) {
            case SENT_PASSWORD:
                content = pass + " la mat khau cua so dien thoai " + toPhoneNumber + " tren www.Fjob.com.vn, trang tuyen dung, tim viec lam theo ban do so 1 Viet Nam. Lien he: " + contactPhoneNum;
                break;
        }
        return content;
    }

    public static String getContentEmail(String type, String pass, String toEmail, String contactPhoneNum) {
        String content = null;
        switch (type) {
            case SENT_PASSWORD:
                content = pass + " la mat khau cua dia chi email " + toEmail + " tren www.Fjob.com.vn, trang tuyen dung, tim viec lam theo ban do so 1 Viet Nam. Lien he: " + contactPhoneNum;
                break;
        }
        return content;
    }
    public static boolean isSendSMS(String content, String toPhoneNumber, String contactPhoneNum) {
        LOGGER.info("=== BẮT ĐẦU GỬI SMS tới {} ===", toPhoneNumber);
        String apiKey = "91ECFCC75107D669DF8955367045E4";
        String secretKey = "55ED3B0129651E37D7C3CE9E20F145";
        String isUnicode = "0";
        String brandName = "";
        String smsType = "1";

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
            ResponseEntity<String> responseEntity = HttpUtils.getData(map, null, urlTemplate, null);
            if (responseEntity.getStatusCode() == HttpStatus.OK) {
                String body = responseEntity.getBody();
                LOGGER.info("Response from eSMS: {}", body);

                Map<String, Object> json = OBJECT_MAPPER.readValue(body, Map.class);
                String codeResult = (String) json.get("CodeResult");
                String errorMessage = (String) json.get("ErrorMessage");

                if ("100".equals(codeResult)) {
                    LOGGER.info("Send message success: {}", errorMessage);
                    return true;
                } else {
                    LOGGER.warn("Send message failed: {} - {}", codeResult, errorMessage);
                }
            }
        } catch (Exception e) {
            LOGGER.error("Send message exception: ", e);
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
        if (status != null) {
            responseObject.setStatus(status);
        }
        responseObject.setCode(code);
        responseObject.setMessage(message);
        responseObject.setData(data);
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
            boolean isGetAll = false;
            if (map.containsKey(IS_GET_ALL)) {
                isGetAll = (boolean) map.get(IS_GET_ALL);
            }
            searchInput.setGetAll(isGetAll);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return searchInput;
    }
    public static boolean isValid(Object object) {
        return object != null && !object.toString().isEmpty();
    }

    public static boolean isExistCoordinates(Coordinates coordinates) {
        return (coordinates != null && coordinates.getLat() != null && coordinates.getLng() != null);
    }

    public static Double distance(Double latLocal, Double lonLocal,
                                  Double latDestination, Double lonDestination) {
        if (latLocal == null || lonLocal == null || latDestination == null || lonDestination == null) {
            return null;
        }
        Double distance = Math.acos(Math.sin(latLocal / 180 * Math.PI)
                * Math.sin(latDestination / 180 * Math.PI)
                + Math.cos(latLocal / 180 * Math.PI)
                * Math.cos(latDestination / 180 * Math.PI)
                * Math.cos(lonDestination / 180 * Math.PI - lonLocal / 180 * Math.PI)) * 6371;
        return Double.parseDouble(new DecimalFormat("##.##").format(distance));
    }
}
