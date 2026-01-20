package com.jober.utilsservice.constant;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
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
    public static String FAILED = "FAILED";
    public static String SUCCESS_CODE = "200";
    public static String FAILED_CODE = "200";
    public static String CONTACT_PHONE = "03599956111";
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

    public static String ID = "id";

    public static String DESC = "desc";
    public static String PROP = "prop";
    public static String TYPE = "type";
    public static String PAGING = "paging";
    public static String IS_GET_ALL = "isGetAll";
    public static final String SENT_PASSWORD = "SENT_PASSWORD";

    public static final String ACTION_CREATE = "CREATE";
    public static final String ACTION_UPDATE = "UPDATE";

    public static final String GRANT_TYPE = "grant_type";
    public static final String USERNAME = "username";
    public static final String PASSWORD = "password";
    public static final String ACCESS_TOKEN = "access_token";

    public static final String CONTACTED_NOTE = "0";
    public static final String SELECTED_NOTE = "1";
    public static final String SIGNED_NOTE = "2";
    public static final String REFUSE_NOTE = "3";
    public static final String UN_SAVE_NOTE = "4";
    public static final String SAVE_NOTE = "5";
    public static final String BUCKET_NAME = "jober-images-bucket";
    public static ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static final String FREELANCER = "freelancer";
    public static final String JOBDEFAULT = "jobDefault";
    public static final String JOBDEFAULTID = "jobDefaultId";
    public static final String JOB = "job";
    public static final String LAT = "lat";
    public static final String LNG = "lng";
    public static final String DEFAULT_PHONE = "0359999561";
    public static final String YEAR = "year";
    public static final String ADDRESS = "address";
    public static final String SALARY = "salary";
    public static final String DATA = "data";

    public static Integer SUPER_ADMIN_NUM = 5;
    public static Integer VICE_ADMIN_NUM = 4;
    public static Integer ADMIN_NUM = 3;
    public static Integer RECRUITER_NUM = 2;
    public static Integer CANDIDATE_NUM = 1;
    public static final String TOKEN = "token";
    public static final String REFRESH_TOKEN = "refresh_token";
    public static final String LOGOUT = "logout";
    public static final String NULL_CODE = "500";
    public static final String SAVED_JOB = "1";
    public static final String PRICE = "price";
    public static final String USER_ID = "userId";
    public static final BigDecimal BONUS_POINT = BigDecimal.valueOf(5);
    public static final Integer ACTIVE = 1;
    public static final Integer INACTIVE = 0;
    public static final String NOT_MODIFIED = "NOT_MODIFIED";

    public static Map<Integer, String> role() {
        Map<Integer, String> map = new HashMap<>();
        map.put(5, SUPER_ADMIN);
        map.put(4, VICE_ADMIN);
        map.put(3, ADMIN);
        map.put(2, RECRUITER);
        map.put(1, CANDIDATE);
        return map;
    }
    public static final String PHONE_REGEX = "(\\+\\d{1,3}( )?)?((\\(\\d{1,3}\\))|\\d{1,3})[- .]?\\d{3,4}[- .]?\\d{4}";
    public static final String EMAIL_REGEX = "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?";
    public static final String FACEBOOK_REGEX = "(?:(?:http|https):\\/\\/)?(?:www.)?facebook.com\\/(?:(?:\\w)*#!\\/)?(?:pages\\/)?(?:[?\\w\\-]*\\/)?(?:profile.php\\?id=(?=\\d.*))?([\\w\\-]*)?";
    public static final String LINKEDIN_REGEX = "(http(s?)://)?(www\\.)?linkedin\\.([a-z])+/(in/)?([A-Za-z0-9]+)+/?";
    public static String [] regexList() {
        return new String[]{PHONE_REGEX, EMAIL_REGEX, FACEBOOK_REGEX, LINKEDIN_REGEX};
    }
}
