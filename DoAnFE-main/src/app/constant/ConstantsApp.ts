import { Constants } from './Constants';

/**
 * Contain constant not multilang
 */
export class ConstantsApp {
  public static access_token = 'access_token';
  public static accessToken = 'accessToken';
  public static refresh_token = 'refresh_token';
  public static refreshToken = 'refreshToken';
  public static role = 'role';
  public static user = 'user';
  public static bearer = 'Bearer ';
  public static currentPage = 'currentPage';
	public static language = 'language';
	public static jobDefaults = 'jobDefaults';


  public static SUPER_ADMIN = 5;
  public static VICE_ADMIN = 4;
  public static ADMIN = 3;
  public static CANDIDATE = 1;
  public static RECRUITER = 2;
  public static ACTIVE = 1;
  public static IN_ACTIVE = 0;

  public static address = 'address';
  public static job = 'job';
  public static name_ = 'name';
  public static year = 'year';
  public static salary = 'salary';
  public static EXISTED = 'EXISTED';
  public static updated = 'UPDATED';
  public static FORGOT_PASS = 'forgot_pass';

  public static TRANSACTION_NAME = "otherReason"

  public static loginPage = 'app-login';
  public static homePage = 'app-map-marker';
  public static candidateInfoPage = 'app-candidate-info-detail';
  public static policyPage = 'app-policy';
  public static listPage = 'app-list';
  public static managementPage = 'app-management';
  public static mapPage = 'job-map';

  public static sendSmsNumber = 'sendSmsNumber';
  public static des = 'des';
  public static cv = 'cv';
  public static active = 'active';
  public static creationDate = 'creationDate';
  public static expDate = 'expDate';
  public static delete = 'delete';
  public static select = 'select';
  public static phone = 'phone';
  public static password = 'password';
  public static action = 'action';
  public static status = 'status';
  public static mathScore = 'mathScore';
  public static reasons = 'reasons';

  public static email = 'email';
  public static rating = 'rating';
  public static point = 'point';
  public static ratio = 'ratio';
  public static money = 'money';
  public static accountInfo = 'accountInfo';
  public static loginNumber = 'loginNumber';
  public static bonusPoint = 'bonusPoint';
  public static totalMoney = 'totalMoney';
  public static SUCCESS_CODE = '200';
  public static NOT_MODIFIED_CODE = '304';
  public static JOB = 'job';
  public static provinces = 'provinces';
  public static birthyear = 'birthyear';
  public static dateOfBirth = 'dateOfBirth';
  public static gender = 'gender';
  public static distance = 'distance';
  public static introPhone = 'introPhone';
  public static note = 'note';
  public static number = 'number';
  public static WARNING_CODE = '300';
  public static FAILED_CODE = '400';
  public static CONFIRM_UPDATE_CODE = 1;
  public static CONFIRM_DEACTIVE_CODE = 2;
  public static CONFIRM_DELETE_CODE = 3;
  public static CONFIRM_CREATING_NEW_POST = 4;
  public static CREATE_NEW = 'CREATE_NEW';
  public static UPDATE_USER = 'UPDATE';
  public static CREATE_FREELANCER = 'CREATE_FREELANCER';
  public static GG_API_KEY = 'AIzaSyDYp_QqhpBXUJ_qYDts8AQe5BWtIFO8dW8';
  public static FULL_TIME = 0;
  public static PART_TIME = 1;
  public static workingType = 'workingType';
  public static jobDefaultId = 'jobDefaultId';
  public static postName = 'namepost';
  public static workingDay = 'workingDay';
  public static appliedDate = 'appliedDate';
  public static tradingDay = 'tradingDay';
  public static activityTrading = 'activityTrading';
  public static numberPoint = 'numberPoint';
  public static desiredSalary = 'salary';
  public static ID = 'id';
  public static DESC = 'DESC';
  public static NOT_EXISTED = 'NOT_EXISTED';
  public static CREATED = 'CREATED';
  public static transferredPoint = 'transferredPoint';
  public static transferredMoney = 'transferredMoney';
  public static actionName = 'actionName';
  public static rejected = '-3';
  public static canceled = '-2';
  public static failed = '-1';
  public static applied = '1';
  public static chosen = '2';
  public static accepted = '3';
  public static interviewed = '4';
  public static passed = '5';
  public static contacted = '6';
  public static done = '7';
  public static saved = '1';
  public static startDate = 'startDate';
  public static jobDefaultName = 'jobDefaultName';
  public static LINK_USER_LIST = '/candidate/userlist';
  public static LINK_WALLET = '/candidate/joberwallet';
  public static LINK_REFERRAL = '/candidate/referralprogram';
  public static SEARCH_PAGE = '/candidate/search';
  public static LINK_JOB_LIST = '/candidate/joblist';
  public static LINK_CANDIDATE_POSTS = '/candidate/posts';
  public static LINK_SAVED_JOBS = '/candidate/savedJobs';
  public static LINK_CALENDAR = '/candidate/calendar';
  public static LINK_PROFILE = '/candidate/profile';
  public static COMPANY_DETAIL = '/candidate/companydetail';

	public static LINK_CANDIDATE_MANAGEMENT = '/recruiter/candidate-management';
  public static LINK_RECRUITER_ORGANIZATION = '/recruiter/organization-management';
  public static LINK_RECRUIT_MANAGEMENT = '/recruiter/recruit-management';
  public static LINK_RECRUITER_REFERRAL = '/recruiter/referral-program';
  public static LINK_RECRUITER_WALLET = '/recruiter/jober-wallet';
  public static LINK_RECRUITER_PROFILE = '/recruiter/profile';
  public static LINK_RECRUITER_CALENDAR = '/recruiter/calendar';
  public static LINK_RECRUITER_CHECK_CV = '/recruiter/freelancer-stats';
  public static LINK_RECRUITER_HOME = '/recruiter-home';
  public static LINK_CANDIDATE_HOME = '/candidate-home';

  public static REJECTED = -3;
  public static CANCELED = -2;
  public static FAILED = -1;
  public static VIEW_LATER = 0;
  public static INTERVIEW_PROCESSING = 0;
  public static APPLIED = 1;
  public static CHOSEN = 2;
  public static ACCEPTED = 3;
  public static INTERVIEWED = 4;
  public static PASSED = 5;
  public static CONTACTED = 6;
  public static DONE = 7;
  public static type = 'type';
  public static REDEEM = 0;
  public static UPGRADE_ACCOUNT = 1;
  public static GET = 'get';
  public static POST = 'post';
  public static ONLINE = 0;
  public static OFFLINE = 1;
  public static WORK = 2;
  public static APP_CANDIDATE_ITEMS_LIST = 'app-candidate-items-list';
  public static LAT_DEFAULT = 21;
  public static LNG_DEFAULT = 106;
  public static APP_PROFILE = 'app-profile';
  public static VI = 'vi';
  public static EN = 'en';
  public static UID = 'uid';
  public static CHANGE_PASS = 'CHANGE_PASS';
  public static jdName = 'jdName';
  public static UNAUTHORIZED_STATUS = 401;
  public static MALE = 1;
  public static FEMALE = 2;
  public static OTHER = 3;
  public static jobName = 'jobName';
  public static PAGE_SIZE = 10;
  public static historyFields = [
    this.tradingDay,
    this.activityTrading,
    this.numberPoint,
  ];

  public static listReferralFields = [
    this.name_,
    this.phone,
    this.email,
    this.birthyear,
    this.gender,
    this.address,
  ];

  public static dataRank = [
    {
      code: 0,
      name: Constants.allLbl,
    },
    {
      code: ConstantsApp.CANDIDATE,
      name: Constants.candidateLbl,
    },
    {
      code: ConstantsApp.RECRUITER,
      name: Constants.recruiterLbl,
    },
    {
      code: ConstantsApp.ADMIN,
      name: Constants.adminLbl,
    },
    {
      code: ConstantsApp.VICE_ADMIN,
      name: Constants.viceAdminLbl,
    },
  ];
  public static dataEvaluate = [
    {
      code: 0,
      name: Constants.allLbl,
    },
    {
      code: 1,
      name: 1,
    },
    {
      code: 2,
      name: 2,
    },
    {
      code: 3,
      name: 3,
    },
    {
      code: 4,
      name: 4,
    },
    {
      code: 5,
      name: 5,
    },
  ];
  public static listUserFields = [
    this.phone,
    this.email,
    this.role,
    this.rating,
    this.bonusPoint,
    this.totalMoney,
    this.loginNumber,
    this.sendSmsNumber,
    this.status,
    this.delete,
    this.select,
  ];

  public static fields = [
    this.name_,
    this.sendSmsNumber,
    this.job,
    this.salary,
    this.des,
    this.cv,
    this.active,
    this.creationDate,
    this.expDate,
    this.delete,
    this.select,
  ];
  public static adminListfields = [
    this.phone,
    // this.password,
    this.status,
    this.role,
    this.delete,
  ];

  public static latestFreelancerfields = [
    this.name_,
    this.sendSmsNumber,
    this.job,
    this.salary,
    this.des,
    this.cv,
    this.status,
    this.creationDate,
    this.delete,
    this.select,
  ];

  public static bonusForUserFields = [
    this.phone,
    this.point,
    this.ratio,
    this.money,
    this.accountInfo,
    this.status,
    this.select,
  ];

  public static suitableCandidatesFields = [
    this.name_,
    this.birthyear,
    this.gender,
    this.job,
    this.address,
    this.distance,
    this.introPhone,
    this.salary,
    this.cv,
    this.phone,
    this.note,
    this.select,
  ];
  public static introducedUsersFields = [
    this.name_,
    this.phone,
    this.email,
    this.birthyear,
    this.gender,
    this.job,
    this.address,
    this.introPhone,
    this.salary,
    this.cv,
    this.select,
  ];

  public static introducingUsersFields = [
    this.name_,
    this.birthyear,
    this.gender,
  ];

  public static rankFields = [this.name_, this.phone, this.creationDate];

  public static myPostFields = [
    this.name_,
    this.job,
    this.salary,
    this.des,
    this.address,
    this.cv,
    this.active,
    this.creationDate,
    this.expDate,
    this.delete,
    this.select,
  ];

  public static matchJobFields = [
    this.name_,
    this.rating,
    this.address,
    this.distance,
    this.job,
    this.number,
    this.expDate,
    this.salary,
    this.des,
    this.creationDate,
    this.note,
    this.select,
  ];

  public static appliedJobFields = [
    this.name_,
    this.rating,
    this.address,
    this.job,
    this.number,
    this.expDate,
    this.salary,
    this.des,
    this.creationDate,
    this.note,
    this.select,
  ];
	public static optionActionProfile=[
		{
			code:1,
			name:`changePassLbl`
		},
		{
			code:2,
			name:"postSearchLbl"
		}
	]
}
