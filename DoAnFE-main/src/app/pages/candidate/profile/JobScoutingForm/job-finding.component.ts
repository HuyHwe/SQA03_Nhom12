import { Component, ViewChild, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { UserService } from 'src/app/service/user.service';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { CommonService } from 'src/app/service/common.service';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { FormGroup, FormControl, Validators, EmailValidator } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { JobFindingService } from './job-finding.service';
import { ToastComponent } from 'src/app/layout/toast/toast.component';
import { MapService } from 'src/app/service/map.service';
import { PopupConfirmComponent } from "../../../../layout/popup/popup-confirm/popup-confirm.component";
import { LocalStorageService } from "../../../../core/auth/local-storage.service";
import { PopupJobFindingComponent } from "../popupJobFinding/popup-job-finding.component";
import { HttpClient } from "@angular/common/http";
import { FileService } from "../../../../service/file-service/FileService";
import { ApiModel } from "../../../../model/ApiModel";
import { AuthService } from "../../../../core/auth/auth.service";
import { User } from "../../../../model/User";
import { Router } from "@angular/router";
import { RouterLinkName } from "../../../../constant/RouterLinkName";
@Component({
  selector: 'app-job-finding',
  templateUrl: './job-finding.component.html',
  styleUrls: ['./job-finding.component.scss']
})

export class JobFinding implements OnInit {
  @Input() userItem: any;
  @Input() isEditMode: any;
  @Input() modeType: any;
  @Input() jobItem: any;
  @Input() parentPageCode: any;
  @Output() validate = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @ViewChild('appToast') appToast: ToastComponent = new ToastComponent();
  @ViewChild('popupConfirmUpdate') popupConfirmUpdate: PopupConfirmComponent = new PopupConfirmComponent();
  @ViewChild('popupConfirmDeactive') popupConfirmDeactive: PopupConfirmComponent = new PopupConfirmComponent();
  @ViewChild('popupConfirmDelete') popupConfirmDelete: PopupConfirmComponent = new PopupConfirmComponent();
  PROFILE_PAGE = ConstantsApp.APP_PROFILE
  cancelLbl = Constants.cancelLbl;
  phoneNumberLbl = Constants.phoneNumberLbl;
  nameLbl = Constants.nameLbl;
  dateOfBirthLbl = Constants.dateOfBirthLbl;
  cv = Constants.CV;
  wardLbl = Constants.wardLbl;
  provinceLbl = Constants.provinceLbl;
  nationalityLbl = Constants.nationalityLbl;
  emailLbl = Constants.emailLbl;
  addressLbl = Constants.addressLbl;
  jobTargetLbl = Constants.jobTargetLbl;
  activeLbl = Constants.activeLbl;

  role: any;
  provinces: any;
  wards: any;
  isChecked: boolean | true;
  addedUser: any;
  genders: any;
  detailUserForm: any;
  province: any;
  ward: any;
  selectedProvince: any;
  selectedWard: any;
  selectedGender: any;
  userItemOrg: any;
  isUpdatedSuccessfully: any;
  messageCode: any;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  dob: any;
  avatarUrl: string | ArrayBuffer | null = null;
  selectedFile: any;
  selectedJobDefault: any;
 items: any[] = [];
jobDefaults: any[] = [];
  bodyGetJobDefault: any;
  candidatePost: any;
  bodyGetPost: any;
  dataSource: any;
  pageMenu: any;

  // Biến mới cho xử lý CV
  isCheckingCV: boolean = false;
  matchScore: number | null = null;
  matchReasons: string[] = [];
  cvError: string = '';
  reasons: never[];
  embedding: any;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private mapService: MapService,
    private jobFindingService: JobFindingService,
    private commonService: CommonService,
    private utilsService: UtilsService,
    private localStorageService: LocalStorageService,
    private popUpJobFindingComponent: PopupJobFindingComponent,
    private fileService: FileService,
    private authService: AuthService,
    private router: Router
  ) {
    this.isChecked = true;
  }

  ngOnInit(): void {
    this.initData();
    console.log('job-finding-component, jobItem = :', this.jobItem);
  }
  initData() {
    this.pageMenu = 1;
    this.genders = [{ code: 1, name: Constants.maleLbl }, { code: 2, name: Constants.femaleLbl }, { code: 3, name: Constants.otherLbl }]
    let item = this.localStorageService.getItem(ConstantsApp.user);
    let date = item && item.birthyear ? new Date(item.birthyear) : new Date();
    let dateString = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + date.getDate();
    this.userItem = item ? {
      address: item.address,
      phone: item.phone,
      name: item.name,
      email: item.email,
      job: item.job,
      birthyear: dateString,
      des: item.des,
      salary: item.salary,
      cv: item.cv,
      img: item.img,
      lat: item.lat,
      lg: item.lg,
      gender: item.gender,
      role: item.role,
      introPhone: item.introPhone,
      jobTarget: item.jobTarget,
      avatar: item.avatar,
      country: 'Việt Nam',
      nationality: 'Việt Nam',
      experience: item.experience,
      province: item.province,
      ward: item.ward,
      skillDes: item.skillDes,
      experienceLevel: item.experienceLevel,
      skillLevel: item.skillLevel
    } : new User();
    this.avatarUrl = environment.CDN_URI + this.userItem.avatar;
    this.userItemOrg = { ...this.userItem };
    if (!this.userItem.province) this.userItem.province = 'Hà Nội';
    if (!this.userItem.ward) this.userItem.ward = 'Hoàn Kiếm';
    if (!this.userItem.jobTarget) {
      this.userItem.jobTarget = null;
    }
    if (!this.userItem.experience) {
      this.userItem.experience = null;
    }
    this.detailUserForm = new FormGroup({
      address: new FormControl(this.userItem.address, [Validators.required]),
      jobTarget: new FormControl(this.userItem.jobTarget),
      experience: new FormControl(this.userItem.experience),
      skillDes: new FormControl(this.userItem.skillDes),
      experienceLevel: new FormControl(this.userItem.experienceLevel, [Validators.min(0)]),
      skillLevel: new FormControl(this.userItem.skillLevel, [Validators.min(0)])

      /*birthyear : new FormControl(this.userItem.birthyear, [Validators.required]),
      email : new FormControl(this.userItem.email, [Validators.required,  Validators.pattern(this.utilsService.emailPattern)]),
      phone : new FormControl('', [Validators.required, Validators.pattern(this.utilsService.phonePattern)]),
      name : new FormControl(this.userItem.name, [Validators.required]),*/
    });

    this.checkDisableForm();
  }
  get salary(): any {
    return this.detailUserForm.get('salary');
  }
  get strength(): any {
    return this.detailUserForm.get('strength');
  }

  get job(): any {
    return this.detailUserForm.get('job');
  }
  get des(): any {
    return this.detailUserForm.get('des');
  }
  get skillDes(): any {
    return this.detailUserForm.get('skillDes');
  }
  get experienceLevel(): any {
    return this.detailUserForm.get('experienceLevel');
  }
  get skillLevel(): any {
    return this.detailUserForm.get('skillLevel');
  }

  /*
  get name(): any {
    return this.detailUserForm.get('name');
  }
  get phone(): any {
    return this.detailUserForm.get('phone');
  }
  get email(): any {
    return this.detailUserForm.get('email');
  }
  get birthyear(): any {
    return this.detailUserForm.get('birthyear');
  }
  */
  get address(): any {
    return this.detailUserForm.get('address');
  }

  saveData() {
    if (this.modeType == ConstantsApp.CREATE_NEW) {
      this.onCreateUser()
    } else if (this.modeType == ConstantsApp.UPDATE_USER) {
      this.onUpdateUser();
    } else if (this.modeType == ConstantsApp.CREATE_FREELANCER) {
      this.onCreateFreelancer();
    }
    this.popUpJobFindingComponent.closePopup();
  }

  checkDisableForm() {
    if (!this.isEditMode) {
      this.detailUserForm.disable();
    } else {
      this.detailUserForm.enable();
    }
  }

  getLocation() {
    // todo google API
    // this.mapService.getPosition().then(pos=>
    //     {
    //       this.center = {lat: pos.lat , lng: pos.lng};
    //     });
    this.retrieveAddress();
  }
  /**
   * build data to the address fields
   * @returns
   */
  retrieveAddress() {
    try {
      let provinceName = this.userItem.province ? this.userItem.province : Constants.provinceNameDefault;
      console.log("provinces:", this.provinces);
      this.selectedProvince = this.utilsService.getAddressByName(this.provinces, provinceName);
      console.log("Selected Province:", this.selectedProvince, " userItem.province:", this.userItem.province);
      let provinceCode = this.selectedProvince.code;
      this.commonService.getWardsByProvince(provinceCode).subscribe(res => {

        if (res && res.data) {
          let data = res.data;
          if (data)
            this.wards = data;
          let wardName = this.userItem.ward ? this.userItem.ward : Constants.wardNameDefault;
          this.selectedWard = this.utilsService.getAddressByName(this.wards, wardName);

        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  getData(jobItem: any) {
    this.bodyGetJobDefault = {
      // levels: [0],
      paging: {
        page: 1,
        size: 100,
      },
    }
    this.bodyGetPost = {
      page: 1,
      size: 1000
    }
    let apiModels = [
      new ApiModel('get all province', environment.API_URI + ApiNameConstants.BS_GET_ALL_PROVINCES, null, ConstantsApp.GET),
    ];
    if (this.authService.authenticated()) {
      apiModels.push(new ApiModel('search user by phone', environment.API_URI + ApiNameConstants.BS_USER_SEARCH, { phone: this.userItem.phone }, ConstantsApp.POST))
    }
    apiModels.push(new ApiModel('get list job children', environment.API_URI + ApiNameConstants.BS_LIST_JOBDEFAULT_REMAIN, this.bodyGetJobDefault, ConstantsApp.POST));
    apiModels.push(new ApiModel('get list post', environment.API_URI + ApiNameConstants.BS_USER_CANDIDATE_POSTS, this.bodyGetPost, ConstantsApp.POST));
    this.commonService
      .retrieveData(apiModels)
      .subscribe(res => {
        if (res && res[0] && res[0].data) {
          this.provinces = res[0].data;
          if (!this.utilsService.getItem(ConstantsApp.provinces)) {
            this.utilsService.setItem(ConstantsApp.provinces, this.provinces);
          }
        }
        if (this.authService.authenticated()) {
          if (res && res[1] && res[1].data) {
            let data = res[1].data;
            this.userItem = data && data ? data : this.userItem;
            this.userItem.birthyear = this.utilsService.formatDate(new Date(this.userItem.dateOfBirth))
          }
          if (this.utilsService.isEmpty(this.jobDefaults)) {
            if (res && res[2] && res[2].data) {
              this.jobDefaults = res[2].data;
              this.dataSource = res[2];
            }
          }
          if (this.utilsService.isEmpty(this.candidatePost)) {
            if (res && res[3] && res[3].data) {
              this.candidatePost = res[3].data.map((postId: { jdId: any }) => postId.jdId);
            }
          }
        } else {
          if (this.utilsService.isEmpty(this.jobDefaults)) {
            if (res && res[1] && res[1].data) {
              this.jobDefaults = res[1].data;
              this.dataSource = res[1];
            }
          }
        }
        // filter không hiển thị những job đã có post
        if (this.jobDefaults != null) {
          this.jobDefaults = this.jobDefaults.filter((job: { id: any }) => !this.candidatePost.includes(job.id));
          this.selectedJobDefault = this.jobDefaults[0];
          // this.jobId = this.selectedJobDefault.id;
          this.userItem.jobId = this.selectedJobDefault.id;
          this.userItemOrg = { ...this.userItem };
        }
        this.buildUserInfoForDisplay();
      },
        (error) => {
          console.error('API error:', error);
        });
    console.log('job-finding-component, jobItem = :', jobItem)
    this.jobItem = jobItem;
  }

  /**
   * build data to the selection fields
   * @returns
   */
  buildUserInfoForDisplay() {
    this.getLocation();
    this.dob = new FormControl(new Date(this.userItem.dateOfBirth))
    this.selectedGender = this.utilsService.buildSelectedItem(ConstantsApp.gender, this.genders, this.userItem);
  }

  // getDistrictsByProvince(provinceCode: any) {
  //   this.commonService.getDistrictsByProvince(provinceCode).subscribe(res => {
  //     if (res && res.data) {
  //       let data = res.data;
  //       if (data) {
  //         this.districts = data;
  //         let item = this.districts[0];
  //         let code = item.code;
  //         this.userItem.district = item.name;
  //         this.selectedDistrict = item.name;
  //         this.getWardsByDistrict(code);
  //       }
  //     }
  //   });
  // }

  getWardsByProvince(provinceCode: any) {
    this.commonService.getWardsByProvince(provinceCode).subscribe(res => {
      if (res && res.data) {
        let data = res.data;
        if (data) {
          this.wards = data;
          let item = this.wards[0];
          this.userItem.ward = item.name;
          this.selectedWard = item;
        }
      }
    });
  }

  onUpdateUser() {
    const functionName = 'updateAdmin';
    const messageLog = 'update an admin';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_UPDATE;
    this.userService
      .postDatas(this.userItem, apiUrl, functionName, messageLog)
      .subscribe((res) => {
        if (res && res.code == ConstantsApp.SUCCESS_CODE) {
          //   alert a message to inform for user
          this.isEditMode = false;
          this.userItemOrg = { ...this.userItem };
          this.isUpdatedSuccessfully = true;
          this.messageCode = ConstantsApp.SUCCESS_CODE;
          this.appToast.show({ messageCode: this.messageCode });
          this.checkDisableForm();
        } else {
          this.isUpdatedSuccessfully = false;
          this.messageCode = ConstantsApp.FAILED_CODE;
          this.appToast.show({ messageCode: this.messageCode });
          // alert a message to inform for user
        }
      });
  }

  onGenderSelected(genderCode: any) {
    this.userItem.gender = genderCode;
    this.selectedGender = this.utilsService.buildSelectedItem(ConstantsApp.gender, this.genders, this.userItem);
  }

  onDateSelected(event: any) {
    let date = event.value;
    this.userItem.birthyear = this.utilsService.formatDate(date);
  }

  onProvinceSelected(provinceCode: any) {
    let province = this.getPositionNameByCode(this.provinces, provinceCode);
    this.province = province.name;
    this.userItem.province = this.province;
    this.getWardsByProvince(provinceCode);
  }

  // onDistrictSelected(districtCode: any) {
  //   let district = this.getPositionNameByCode(this.districts, districtCode);
  //   this.district = district.name;
  //   this.userItem.district = this.district;
  //   this.getWardsByDistrict(districtCode);
  //   if (this.wards && this.wards.length > 0) {
  //     this.selectedWard = this.wards[0].code; // Assuming your wards have a 'code' property
  //     this.onWardSelected(this.selectedWard);
  //   }
  // }

  onWardSelected(wardCode: any) {
    let ward = this.getPositionNameByCode(this.wards, wardCode);
    this.ward = ward.name;
    this.userItem.ward = this.ward;
    this.selectedWard = ward;
  }
  getPositionNameByCode(data: any, code: any) {
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      if (item.code == code) {
        return item;
      }
    }
  }

  onCreateUser() {
    let functionName = 'onCreateUser';
    let messageLog = 'creating freelancer';
    let toastMessageCode = ''
    let apiUrl = environment.API_URI + ApiNameConstants.BS_USER_CREATE;
    try {
      this.userService.postDatas(this.userItem, apiUrl, functionName, messageLog)
        .subscribe(res => {
          if (res) {
            toastMessageCode = ConstantsApp.SUCCESS_CODE;
            this.validate.emit(ConstantsApp.SUCCESS_CODE);
          } else {
            toastMessageCode = ConstantsApp.SUCCESS_CODE;
          }
          this.appToast.show({ messageCode: toastMessageCode });
        });
    } catch (error) {
      console.log('onCreateUser: ' + error);
      this.appToast.show({ messageCode: toastMessageCode });
    }
  }

  onCreateFreelancer() {
    let functionName = 'onCreateFreelancer';
    let messageLog = 'creating freelancer';
    let toastMessageCode = '';
  if (!this.jobItem?.jobDefaultId) {
  this.userItem.jobDefaultId = this.jobDefaults?.[0]?.id ?? null;
} else {
  this.userItem.jobDefaultId = this.jobItem.jobDefaultId;
}

    this.userItem.cv = this.selectedFile ? this.selectedFile.name : null;
    let apiUrl = environment.API_URI + ApiNameConstants.BS_USER_FREELANCER_CREATE_V2;
    if (this.selectedWard && this.selectedWard.lat && this.selectedWard.lng) {
      this.userItem.lat = this.selectedWard.lat;
      this.userItem.lng = this.selectedWard.lng;
    }
    try {
      console.log("userItem Job finding: ", this.userItem)
      console.log("jobItem Job finding: ", this.jobItem)
      const freelancerData = {
        jobId: this.jobItem.id,
        userId: this.userItem.id,
        jobDefaultId: this.userItem.jobDefaultId,
        name: this.userItem.name,
        job: this.jobItem.name || null,
        birthyear: this.userItem.birthyear,
        gender: this.userItem.gender,
        des: this.userItem.des || null,
        address: this.userItem.detailAddress,
        lat: this.userItem.lat,
        lng: this.userItem.lng,
        cv: this.userItem.cv,
        workingType: this.jobItem.workingType || null,
        status: this.jobItem.status || null,
        img: this.userItem.avatar,
        phone: this.userItem.phone,
        email: this.userItem.email,
        experienceDes: this.userItem.experience,
        skillDes: this.userItem.skillDes || null,
        salary: this.jobItem.salary || null,
        ward: this.userItem.ward,
        province: this.userItem.province,
        jobTarget: this.userItem.jobTarget,
        experienceLevel: this.userItem.experienceLevel || null,
        skillLevel: this.userItem.skillLevel || null,
        mathScore: this.matchScore || 0,
        reasons : this.matchReasons.join(', '),
        cvEmbedding: this.embedding || null
      };
      console.log("freelancerData to create: ", freelancerData)
      this.userService.postDatas(freelancerData, apiUrl, functionName, messageLog)
        .subscribe(res => {
          if (res) {
            if (res.data && res.status != 'EXISTED') {
              let freelancerId = res.data.id;
              this.uploadFile(freelancerId);
              toastMessageCode = ConstantsApp.SUCCESS_CODE;
            }
            else {
              toastMessageCode = ConstantsApp.FAILED_CODE;
            }
          } else {
            toastMessageCode = ConstantsApp.SUCCESS_CODE;
          }
          this.validate.emit({ messageCode: toastMessageCode, message: "createSuccessful" });
          this.router.navigate(['/candidate/posts']);
          // this.appToast.show({messageCode: toastMessageCode});
        });
    } catch (error) {
      console.log('onCreateUser: ' + error);
      // this.appToast.show({messageCode: toastMessageCode});
    }
  }

  uploadFile(freelancerId: number) {
    if (this.selectedFile) {
      let lastIdxOfDot = this.selectedFile.name.lastIndexOf('.');
      let fileName = this.selectedFile.name.substring(0, lastIdxOfDot);
      let fileType = this.selectedFile.name.substring(lastIdxOfDot);
      fileName = freelancerId + '_' + fileName + fileType;
      let newFile = new File([this.selectedFile], fileName, {
        type: this.selectedFile.type,
      });
      this.fileService.uploadFile(newFile).subscribe(
        data => {
          console.log('uploadFile response: ', data);
          // todo need to check if in candidate-home, not redirect
          // this.router.navigate(['/' + ConstantsApp.LINK_CANDIDATE_POSTS]);
        },
        error => {
          console.error('uploadFile error: ', error);
          // this.router.navigate(['/' + ConstantsApp.LINK_CANDIDATE_POSTS]);

        }
      );
    }
  }

async onFileSelected(event: any) {
  try {
    const inputEl = event.target as HTMLInputElement;
    if (!inputEl.files || inputEl.files.length === 0) return;

    this.selectedFile = inputEl.files[0];

    /** reset input để chọn lại cùng file vẫn trigger */
    inputEl.value = '';

    // ===== 1. Validate file =====
    const ext = this.selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'xlsx'].includes(ext || '')) {
      this.cvError = 'Chỉ chấp nhận file PDF, DOCX hoặc XLSX';
      this.selectedFile = null;
      return;
    }

    this.isCheckingCV = true;
    this.cvError = '';
    this.matchScore = null;
    this.matchReasons = [];

    // ===== 2. Build job payload =====
   const jobItemPayload = {
  jobDesc: this.jobItem?.des || this.jobItem?.name || '',
  requiredExperienceLevel: Number(this.jobItem?.requiredExperienceLevel ?? 0),
  requiredSkill: this.jobItem?.requiredSkill || '',
  requiredSkillLevel: Number(this.jobItem?.requiredSkillLevel ?? 0),
};


    // ===== 3. Build FormData =====
    const formData = new FormData();
    formData.append('job_item_json', JSON.stringify(jobItemPayload));
    formData.append('cv_file', this.selectedFile);

    // ===== 4. Thử nhiều base URL (Docker / local) =====
  const baseUrl = 'http://localhost:8000';

    let lastError: any = null;
    console.log('[CV PAYLOAD]', jobItemPayload);

 const response = await fetch(`${baseUrl}/parse-cv-and-match`, {
  method: 'POST',
  body: formData,
});

    if (!response) {
      throw lastError || new Error('Không kết nối được server xử lý CV');
    }

    // ===== 5. Parse response =====
    const res = await response.json();
    this.isCheckingCV = false;

  if (res.error) {
  this.cvError = res.error;
  this.isCheckingCV = false;
  return;
}

if (res.is_valid_cv !== true) {
  this.cvError = 'CV không hợp lệ';
  this.isCheckingCV = false;
  return;
}


    // ===== 6. Apply result =====
this.matchScore = res.match_score;
this.matchReasons = res.reasons || [];
this.embedding = res.cv_data?.embedding || null;

   if (res.cv_data) {
  this.userItem.experienceLevel =
    res.cv_data.experience_level ?? this.userItem.experienceLevel;

  this.userItem.skillLevel =
    res.cv_data.skill_level ?? this.userItem.skillLevel;

  this.embedding = res.cv_data.embedding ?? null;

  this.detailUserForm.patchValue({
    experienceLevel: this.userItem.experienceLevel,
    skillLevel: this.userItem.skillLevel,
  });
}

  } catch (err: any) {
    console.error('CV upload error:', err);
    this.isCheckingCV = false;
    this.cvError =
      err?.message ||
      'Không thể xử lý CV. Vui lòng kiểm tra server và thử lại.';
  }
}



  onJobDefaultSelected(item: any) {
    if (!this.jobItem) {
      this.jobItem = {};
    }
    if (item) {
      this.jobItem.jobDefaultId = item.id;
    }
    this.selectedJobDefault = item;
  }
  refetchSelectMenu(el: any) {
    if (this.bodyGetJobDefault.keySearch) {
      if (el.filteredItems.length == 0 && el.searchInput.startsWith(this.bodyGetJobDefault.keySearch) && el.searchInput.length > this.bodyGetJobDefault.keySearch.length) {
        return;
      }
    }
    this.bodyGetJobDefault.keySearch = el.searchInput;
    this.retriveJobDefault();
  }
  refetchScrollMenu(el: any) {
    if (el.paging > this.dataSource.totalPage) {
      return;
    }
    this.pageMenu = el.paging;
    this.bodyGetJobDefault.paging.page = this.pageMenu;
    this.retriveJobDefault();
  }

  retriveJobDefault() {
    const apiUrl = environment.API_URI + ApiNameConstants.BS_LIST_JOBDEFAULT_REMAIN;
    this.commonService
      .postDatas(this.bodyGetJobDefault, apiUrl, 'getData', 'get list job children')
      .subscribe(
        (res: any) => {
          if (res && res.data) {
            this.jobDefaults = [...this.jobDefaults, ...res.data];
            this.dataSource = res;
          } else {
            // this.isDisplayAddressForm = true;
          }
        },
        (error) => {
          console.error('API error:', error);
        }
      );
  }
}