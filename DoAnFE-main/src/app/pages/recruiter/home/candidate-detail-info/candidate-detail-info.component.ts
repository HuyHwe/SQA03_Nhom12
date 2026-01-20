import {
  Component,
  ViewChild,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import { Router } from "@angular/router";
import { UserService } from 'src/app/service/user.service';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { CommonService } from 'src/app/service/common.service';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { FormGroup, FormControl, Validators, EmailValidator } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { ToastComponent } from 'src/app/layout/toast/toast.component';
import { MapService } from 'src/app/service/map.service';
import { ProfileCandidateService } from "../../../candidate/profile/profile.service";
import { ApiModel } from "../../../../model/ApiModel";
import { FileService } from "../../../../service/file-service/FileService";
import { AuthService } from "../../../../core/auth/auth.service";
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';
import { User } from "../../../../model/User";
import { PopupCreatingPostComponent } from "../../popup/popup-creating-post/popup-creating-post.component";
import { PopupConfirmComponent } from "../../../form/popup-confirm/popup-confirm.component";
import { PopupBookingInterviewComponent } from '../../candidate-management/table-candidate/popup-booking-interview/popup-booking-interview.component';
import { NotificationService } from 'src/app/pages/notification/notification.service';
import { OnDestroy } from '@angular/core';

@Component({
  selector: 'app-candidate-detail-info',
  templateUrl: './candidate-detail-info.component.html',
  styleUrls: ['./candidate-detail-info.component.scss']
})

export class CandidateDetailInfoComponent implements OnInit, OnChanges {
  private readonly CDN_URI = `${environment.CDN_URI}`;
  @Input() parentPageCode: string;
  @Input() userItem: any;
  @Input() jobDefaultId: any;
  @Input() isEditMode: any;
  @Input() modeType: any;
  @Input() freelancerId: number;
  @Input() status: number;
  @Output() validate = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() onInterview = new EventEmitter();
  @ViewChild('appToast') appToast: ToastComponent = new ToastComponent();
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
  experienceLbl = Constants.experienceLbl;
  activeLbl = Constants.activeLbl;
  provinces: any;
  wards: any;
  isChecked: boolean | true;
  genders: any;
  detailUserForm: any;
  province: any;
  ward: any;
  userTypes: any;
  selectedProvince: any;
  selectedWard: any;
  selectedUserType: any;
  selectedGender: any;
  userItemOrg: any;
  messageCode: any;
  CONFIRM_CREATING_NEW_POST = ConstantsApp.CONFIRM_CREATING_NEW_POST;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  dob: any;
  avatarUrl: string | ArrayBuffer | null = null;
  user: any;
  role: any;
  recruiterRole: any;
  actionMobile: any;
  jobId: number;
  chosenStatus: number = ConstantsApp.CHOSEN;
  APP_CANDIDATE_ITEMS_LIST: string = ConstantsApp.APP_CANDIDATE_ITEMS_LIST;
  authenticated: boolean;
  @ViewChild('popupCreatingPost') popupCreatingPost: PopupCreatingPostComponent = new PopupCreatingPostComponent(this.commonService);
  @ViewChild('popupInformCreatingPost') popupInformCreatingPost: PopupConfirmComponent = new PopupConfirmComponent();
  @Output() popupBookingInterview: PopupBookingInterviewComponent = new PopupBookingInterviewComponent(this.utilsService, this.commonService, this.notificationService, this.localStorage);
ngOnDestroy(): void {
    document.body.classList.remove('popup-open');
  }
  constructor(
    private userService: UserService,
    private mapService: MapService,
    private userDetailService: ProfileCandidateService,
    private commonService: CommonService,
    private localStorage: LocalStorageService,
    private fileService: FileService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private utilsService: UtilsService,
    private notificationService: NotificationService) {
    this.user = JSON.parse(this.utilsService.getItem(ConstantsApp.user));
    this.role = this.localStorage.getItem(ConstantsApp.role);
    this.recruiterRole = ConstantsApp.RECRUITER;
    this.isChecked = true;

  }

  ngOnInit() {
    document.body.classList.add('popup-open');
    this.authenticated = this.authService.authenticated();
    this.initData();
    this.getData();

  }
  initData() {
    this.actionMobile = ConstantsApp.optionActionProfile;
    this.genders = [{ code: 1, name: Constants.maleLbl }, { code: 2, name: Constants.femaleLbl }, { code: 3, name: Constants.otherLbl }]
    let item = this.localStorage.getItem(ConstantsApp.user);
    let date = new Date();
    if (item) {
      date = item.birthyear ? new Date(item.birthyear) : item.dateOfBirth ? new Date(item.dateOfBirth) : new Date();
    }
    let dateString = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + date.getDate();
    if (!this.userItem) {
      this.userItem = item ? {
        detailAddress: item.address,
        address: item.address,
        phone: item.phone,
        name: item.name,
        email: item.email,
        job: item.job,
        dateOfBirth: dateString,
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
        country: 'Việt Nam',
        nationality: 'Việt Nam',
        experience: item.experience,
        province: item.province ? item.province : 'Hà Nội',
        ward: item.ward ? item.ward : 'Hoàn Kiếm',
        avatar: item.avatar ? `${item.avatar}` : null,
        status: item.status,
        recruiterRate: {
          totalCount: 0,
          averageRating: 0,
          rating1Star: 0,
          rating2Star: 0,
          rating3Star: 0,
          rating4Star: 0,
          rating5Star: 0
        },
      } : new User();
      if (this.userItem.avatar != null) {
        this.avatarUrl = `${this.userItem.avatar}`;
      }
      // this.getData();
      console.log("userItem: ", this.userItem);
    }

    this.userItemOrg = { ...this.userItem };
    if (!this.userItem.province) this.userItem.province = 'Hà Nội';
    if (!this.userItem.ward) this.userItem.ward = 'Hoàn Kiếm';
    if (!this.userItem.jobTarget) {
      this.userItem.jobTarget = null;
    }
    if (!this.userItem.experience) {
      this.userItem.experience = null;
    }
    console.log("userItem: ", this.userItem);
    this.detailUserForm = new FormGroup({
      phone: new FormControl('', [Validators.required, Validators.pattern(this.utilsService.phonePattern)]),
      name: new FormControl(this.userItem.name, [Validators.required]),
      detailAddress: new FormControl(this.userItem.detailAddress, [Validators.required]),
      jobTarget: new FormControl(this.userItem.jobTarget),
      experience: new FormControl(this.userItem.experience),
      birthyear: new FormControl(new Date(this.userItem.dateOfBirth), [Validators.required]),
      email: new FormControl(this.userItem.email, [Validators.required, Validators.pattern(this.utilsService.emailPattern)]),
    });

    console.log("detailAddress", this.userItem.detailAddress);
    console.log(" this.detailUserForm", this.detailUserForm)
    this.checkDisableForm();
    //this.getData();
  }
  get phone(): any {
    return this.detailUserForm.get('phone');
  }
  get salary(): any {
    return this.detailUserForm.get('salary');
  }
  get strength(): any {
    return this.detailUserForm.get('strength');
  }
  get name(): any {
    return this.detailUserForm.get('name');
  }
  get job(): any {
    return this.detailUserForm.get('job');
  }
  get des(): any {
    return this.detailUserForm.get('des');
  }
  get email(): any {
    return this.detailUserForm.get('email');
  }
  get address(): any {
    return this.detailUserForm.get('detailAddress');
  }
  get birthyear(): any {
    return this.detailUserForm.get('birthyear');
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
  async retrieveAddress() {
    try {
      // Get province information
      let provinceName = this.userItem.province;
      this.selectedProvince = this.utilsService.getAddressByName(this.provinces, provinceName);
      let provinceCode = this.selectedProvince.code;

      // Fetch districts by province

      const wardResponse = await this.commonService.getWardsByProvince(provinceCode).toPromise();
      if (wardResponse && wardResponse.data) {
        this.wards = wardResponse.data;

        // Get ward information
        let wardName = this.userItem.ward;
        this.selectedWard = this.utilsService.getAddressByName(this.wards, wardName);

      }
    } catch (e) {
      console.error('Error retrieving address:', e);
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
  // Chỉ trigger khi freelancerId thay đổi (không phải lần đầu)
  if (changes['freelancerId'] && changes['freelancerId'].currentValue !== undefined) {
    console.log('freelancerId changed to:', changes['freelancerId'].currentValue);  // Log để debug
    this.userItem = null;  // Reset userItem cũ để tránh cache sai
    this.initData();  // Re-init form với input mới
    this.getData();  // Re-call API với freelancerId mới
  }
}


  checkIsRecruited() {
    this.getCandidateInfo();
    // let apiUrl = environment.API_URI + ApiNameConstants.BS_JOB_GET_BY_JOBDEFAULT_ID + '?jobDefaultId=' + this.jobDefaultId;
    // console.log(apiUrl);
    // this.commonService
    //   .getData(apiUrl, 'checkIsRecruited', '' )
    //   .subscribe(res => {
    //       if (res) {
    //         this.jobId = res;
    //       }
    //       this.getCandidateInfo();
    //       //this.initData();
    //     },
    //     (error) => {
    //       this.getCandidateInfo();
    //       console.error('checkIsRecruited API error:', error);
    //     });
  }


  getCandidateInfo() {
    if (!this.jobId) {
      console.log('Thiếu jobId khi gọi API!');
    }

    let apiModels = [
      new ApiModel('get freelancer by id', environment.API_URI + ApiNameConstants.BS_USER_FREELANCER_GET_BY_ID + '?freelancerId=' + this.freelancerId + (this.jobId ? '&jobId=' + this.jobId : ''), null, ConstantsApp.GET),
      new ApiModel('get all province', environment.API_URI + ApiNameConstants.BS_GET_ALL_PROVINCES, null, ConstantsApp.GET),
    ];

    this.commonService
      .retrieveData(apiModels)
      .subscribe(res => {
        if (res && res[0] && res[0].data) {
          let data = res[0].data;
          console.log("data: ", data);
          this.userItem = data && data ? data : this.userItem;
          this.userItem.cvMatchScore = data.matchScore;
          this.userItem.freelancerId = this.freelancerId;
          this.userItem.dateOfBirth = this.userItem.dateOfBirth ? this.utilsService.formatDate(new Date(this.userItem.dateOfBirth)) : new Date();
          this.avatarUrl = `${this.userItem.avatar}`;
          console.log('user status: ', this.userItem.status);
        }
        if (res && res[1] && res[1].data) {
          this.provinces = res[1].data;
          if (!this.utilsService.getItem(ConstantsApp.provinces)) {
            this.utilsService.setItem(ConstantsApp.provinces, this.provinces);
          }
        }
        this.buildUserInfoForDisplay();
        console.log("userItem: ", this.userItem);
      },
        (error) => {
          console.error('API error:', error);
        });
  }

  getData() {
    console.log("get Data");
    this.checkIsRecruited();
    //this.initData();
  }

  /**
  * build data to the selection fields
  * @returns
  */
  buildUserInfoForDisplay() {
    //this.getLocation();
    this.retrieveAddress();
    this.dob = new FormControl(new Date(this.userItem.dateOfBirth))
    this.selectedGender = this.utilsService.buildSelectedItem(ConstantsApp.gender, this.genders, this.userItem);
    this.selectedUserType = this.utilsService.buildSelectedItem(ConstantsApp.role, this.userTypes, this.userItem);
    this.detailUserForm.patchValue({
      detailAddress: this.userItem.detailAddress
    });
  }
  onOpenInterviewPopup() {
    this.popupBookingInterview.openPopup(1);
  }
closeCandidateInfoPopup() {
  document.body.classList.remove('popup-open'); // 🔓 mở lại scroll

  this.popupBookingInterview.closePopup();
}

  /**
   * Check this recruiter have post corresponding with this job, if not, request creat a post
   */
  checkExistedJob() {
    let authenticated = this.authService.authenticated();
    if (!authenticated) {
      this.router.navigate(["/app-login"]);
      return;
    }
    let apiUrl = environment.API_URI + ApiNameConstants.BS_JOB_GET_BY_JOBDEFAULT_ID + '?jobDefaultId=' + this.jobDefaultId;
    this.commonService
      .getData(apiUrl, 'checkExistedJob', '')
      .subscribe(res => {
        if (res) {
          this.jobId = res;
          this.onRecruit();
        } else {
          this.showPopupInformCreatingPost();
        }
      },
        (error) => {
          console.error('API error:', error);
        });
  }

  onRecruit() {
    let body = {
      freelancerId: this.freelancerId,
      jobId: this.jobId,
      status: ConstantsApp.CHOSEN
    };
    const functionName = 'recruit';
    const messageLog = 'apply this job';
    let apiUrl = environment.API_URI + ApiNameConstants.BS_USER_SCHEDULE_SAVE;
    this.commonService
      .postDatas(body, apiUrl, functionName, messageLog)
      .subscribe(
        (res: any) => {
          if (res && res.status == ConstantsApp.CREATED) {
            this.router.navigate(['/' + ConstantsApp.LINK_CANDIDATE_MANAGEMENT]);
          }
        },
        (error) => {
          console.error('API error:', error);
        }
      );
  }
  showPopupCreatingPost() {
    this.popupCreatingPost.openPopup();
  }
  showPopupInformCreatingPost() {
    this.popupInformCreatingPost.openPopup();
  }
  onDownloadCv(item: any) {
    if (!this.authenticated) {
      this.router.navigate(["/app-login"]);
      return;
    }
    this.commonService.downloadCv(item);
  }


}
