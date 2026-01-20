package com.resourceservice.utilsmodule.constant;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

public class Constant {
    public static final String ROLE = "ROLE";
    public static final String SUPER_ADMIN = "SUPER_ADMIN";
    public static final String VICE_ADMIN = "VICE_ADMIN";
    public static final String ADMIN = "ADMIN";
    public static final String CANDIDATE = "CANDIDATE";
    public static final String RECRUITER = "RECRUITER";
    public static final String BLOCKED_USER = "BLOCKED_USER";
    public static final String STATISTICAL_BY_YEAR = "STATISTICAL_BY_YEAR";
    public static final String STATISTICAL_BY_MONTH = "STATISTICAL_BY_MONTH";
    public static final String STATISTICAL_BY_QUARTER = "STATISTICAL_BY_QUARTER";
    public static final String ERROR = "ERROR";
    public static final String SUCCESS_CODE = "200";
    public static final String NOT_MODIFY = "304";
    public static final String NULL_CODE = "500";
    public static final String CONTACT_PHONE = "0359999561";
    public static final String viceAdminRole = "viceAdminRole";
    public static final String adminRole = "adminRole";
    public static final String PAGE = "page";
    public static final String SIZE = "size";
    public static final String FETCH = "fetch";
    public static final String FILTER = "filter";
    public static final String ASC = "ASC";
    public static final String MATCHING_AND = "matchingAnd";
    public static final String MATCHING_OR = "matchingOr";
    public static final String SORT = "sort";
    public static final String PROP = "prop";
    public static final String TYPE = "type";
    public static final String PAGING = "paging";

    public static final Integer LIMIT_DISTANCE= 30;
    public static final String SENT_PASSWORD = "SENT_PASSWORD";

    public static final String ACTION_CREATE = "CREATE";
    public static final String ACTION_UPDATE = "UPDATE";
    public static final String FORGOT_PASS = "forgot_pass";

    public static final String CHANGE_PASS = "change_pass";
    public static final String GRANT_TYPE = "grant_type";
    public static final String USERNAME = "username";
    public static final String PASSWORD = "password";
    public static final String ACCESS_TOKEN = "access_token";
    public static final String ACTIVE_FEE = "activefee";
    public static final String FEE_PER_SELECT_ONE_FREELANCER = "fee_per_select_one_freelancer";
    public static final String REFRESH_TOKEN = "refresh_token";
    public static final String TOKEN_TYPE = "token_type";
    public static final String EXPIRES_IN = "expires_in";
    public static final String TOKEN = "token";
    public static final String LOGOUT = "logout";
    public static final String USER = "user";
    public static final String TOKEN_OBJ = "tokenObj";
    public static ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    public static final String SUPER_ADMIN_NUM = "5";
    public static final String VICE_ADMIN_NUM = "4";
    public static final String ADMIN_NUM = "3";
    public static final String RECRUITER_NUM = "2";
    public static final String CANDIDATE_NUM = "1";

    public static Map<Integer, String> role() {
        Map<Integer, String> map = new HashMap<>();
        map.put(5, SUPER_ADMIN);
        map.put(4, VICE_ADMIN);
        map.put(3, ADMIN);
        map.put(2, RECRUITER);
        map.put(1, CANDIDATE);
        return map;
    }
}
