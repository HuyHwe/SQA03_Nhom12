package com.configurationservice.utilsmodule.constant;

public class APIConstant {
    public static final String BS_USER_SEARCH = "/bs-user/user_common/_search";
    public static final String BS_USER_FREELANCER = "/bs-freelancer/_search_freelancers";
    public static final String BS_USER_CANDIDATE = "/recruiter/candidates";
    public static final String BS_USER_SIGNIN = "/bs-user/login";
    public static final String BS_USER_SIGNOUT = "/user_common/logout";
    public static final String BS_USER_UPDATE = "/bs-user/user_common/_update";
    public static final String BS_USER_CREATE = "/bs-user/user_common/_create";
    public static final String BS_USER_CHANGE_PASS = "/bs-user/user_common/_change_pass";
    public static final String BS_JOB_SEARCH_NEAR_BY = "/bs-job/_search_jobs_near_by";
    public static final String BS_JOB_SEARCH= "/bs-job/_search_jobs";
    public static final String BS_CANDIDATE_JOBS= "/candidate/jobs";
    public static final String BS_CANDIDATE_SAVED= "/recruiter/candidates/saved";
    public static final String BS_JOB_DEFAULT_SEARCH= "/bs-configuration/job_default/_search";
    public static final String BS_JOB_CHILDREN_SEARCH= "/bs-configuration/job_default/_search_with_children";
    public static final String BS_USER_GET_TOTAL_USER ="/bs-user/getTotalUserByRole";
    public static final String BS_PAYMENT_UPDATE_TRANSACTION = "/bs-payment/api/momo/ipn_handler";
}
