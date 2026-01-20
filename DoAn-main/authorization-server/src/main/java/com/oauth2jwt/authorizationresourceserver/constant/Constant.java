package com.oauth2jwt.authorizationresourceserver.constant;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

public class Constant {
    public static String ROLE = "ROLE";
    public static String SUPER_ADMIN = "SUPER_ADMIN";
    public static String VICE_ADMIN = "VICE_ADMIN";
    public static String ADMIN = "ADMIN";
    public static String CANDIDATE = "CANDIDATE";
    public static String RECRUITER = "RECRUITER";
    public static String ERROR = "ERROR";
    public static String SUCCESS_CODE = "200";
    public static String CONTACT_PHONE = "0359999561";
    public static String viceAdminRole = "viceAdminRole";
    public static String adminRole = "adminRole";
    public static String PAGE = "page";
    public static String SIZE = "size";
    public static String FETCH = "fetch";
    public static String FILTER = "filter";
    public static String ASC = "ASC";
    public static String MATCHING_AND = "matchingAnd";
    public static String MATCHING_OR = "matchingOr";
    public static String SORT = "sort";
    public static String PROP = "prop";
    public static String TYPE = "type";
    public static String PAGING = "paging";
    public static final String SENT_PASSWORD = "SENT_PASSWORD";

    public static final String ACTION_CREATE = "CREATE";
    public static final String ACTION_UPDATE = "UPDATE";

    public static final String GRANT_TYPE = "grant_type";
    public static final String USERNAME = "username";
    public static final String PASSWORD = "password";
    public static final String ACCESS_TOKEN = "access_token";
    public static ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    /*public static Integer SUPER_ADMIN_NUM = 5;
    public static Integer VICE_ADMIN_NUM = 4;
    public static Integer ADMIN_NUM = 3;
    public static Integer RECRUITER_NUM = 2;
    public static Integer CANDIDATE_NUM = 1;*/

    public static Map<Integer, String> role() {
        Map<Integer, String> map = new HashMap<>();
        //7 means paid users
        map.put(7, CANDIDATE);
        map.put(5, SUPER_ADMIN);
        map.put(4, VICE_ADMIN);
        map.put(3, ADMIN);
        map.put(2, RECRUITER);
        map.put(1, CANDIDATE);
        return map;
    }
}
