package com.paymentservice.utilsmodule.constant;

public class APIConstant {
    public static final String BS_USER_SEARCH = "/bs-user/user_common/_search";
    public static final String BS_USER_FREELANCER = "/bs-freelancer/_search_freelancers";
    public static final String BS_USER_CANDIDATE = "/recruiter/candidates";
    public static final String BS_USER_SIGNIN = "/bs-user/login";
    public static final String BS_USER_SIGNOUT = "/user_common/logout";
    public static final String BS_USER_CREATE = "/bs-user/user_common/_create";
    public static final String BS_USER_CHANGE_PASS = "/bs-user/user_common/_change_pass";
    public static final String BS_JOB_SEARCH_NEAR_BY = "/bs-job/_search_jobs_near_by";
    public static final String BS_JOB_SEARCH= "/bs-job/_search_jobs";
    public static final String BS_CANDIDATE_JOBS= "/candidate/jobs";
    public static final String BS_CANDIDATE_SAVED= "/recruiter/candidates/saved";
    public static final String FE_CANDIDATE_REFERRAL_PROGRAM = "/candidate/referralprogram";
    public static final String FE_PAYMENT_FAILED = "/payment-failed";
    public static final String BS_PAYMENT_CALLBACK = "/bs-payment/vnpay/payment-callback";
    public  static final String BS_PAYMENT_TRANSACTION_UPDATE = "/bs-payment/api/momo/ipn_handler";
}
