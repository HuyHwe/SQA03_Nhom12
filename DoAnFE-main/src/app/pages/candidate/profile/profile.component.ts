import {
  Component,
  ViewChild,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import { UserService } from 'src/app/service/user.service';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { CommonService } from 'src/app/service/common.service';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { FormGroup, FormControl, Validators, EmailValidator } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { ToastComponent } from 'src/app/layout/toast/toast.component';
import { PopupConfirmComponent } from '../../form/popup-confirm/popup-confirm.component';
import { MapService } from 'src/app/service/map.service';
import { ProfileCandidateService } from './profile.service';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';
import { PopupChangePasswordComponent } from './popupChangePassword/popup-change-password.component';
import { PopupUpgradeAccount } from './popupUpgradeUser/popup-upgrade-account.component';
import { PopupConfirmUpgradeAccount } from './popupConfirmUpgradeUser/popup-confirm-upgrade-account.component';
import { PopupJobFindingComponent } from './popupJobFinding/popup-job-finding.component';
import { FileService } from "../../../service/file-service/FileService";
import { PopupRequestTopupComponent } from "./popupRequestTopup/popup-request-topup.component";
import { Package } from "../../../model/Package";
import { Wallet } from "../../../model/Wallet";
import { ApiModel } from "../../../model/ApiModel";
import { PopupCreatingPostComponent } from "../../recruiter/popup/popup-creating-post/popup-creating-post.component";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/auth/auth.service";
import { User } from "../../../model/User";
import { PopupCVMangagementComponent } from './popupCVMangagement/popup-cv-management.component';
import { ExportService } from 'src/app/service/export.service';
@Component({
  selector: 'app-profile-candidate',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileCandidateComponent implements OnInit {
  private readonly CDN_URI = `${environment.CDN_URI}`;
  @Input() userItem: any;
  @Input() isEditMode: any;
  @Input() modeType: any;
  @Input() status: number;
  @Output() validate = new EventEmitter();
  @Output() uploadAvatar = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @ViewChild('appToast') appToast: ToastComponent = new ToastComponent();
  @ViewChild('popupConfirmUpdate') popupConfirmUpdate: PopupConfirmComponent = new PopupConfirmComponent();
  @ViewChild('popupConfirmDeactive') popupConfirmDeactive: PopupConfirmComponent = new PopupConfirmComponent();
  @ViewChild('popupConfirmDelete') popupConfirmDelete: PopupConfirmComponent = new PopupConfirmComponent();
  @ViewChild('popupUpgradeAccount') popupUpgradeAccount: PopupUpgradeAccount = new PopupUpgradeAccount(this.commonService, this.utilsService);
  @ViewChild('jobFinding')
  jobFindingPopUp!: PopupJobFindingComponent;

  @ViewChild('popupChangePassword') popupChangePassword: PopupChangePasswordComponent = new PopupChangePasswordComponent();
  @ViewChild('popupConfirm') popupConfirm: PopupConfirmUpgradeAccount = new PopupConfirmUpgradeAccount();
  @ViewChild('popupRequestTopup') popupRequestTopup: PopupRequestTopupComponent = new PopupRequestTopupComponent(this.commonService, this.utilsService);
  @ViewChild('popupCVManagement') popupCVManagement: PopupCVMangagementComponent = new PopupCVMangagementComponent(this.commonService, this.utilsService, this.exportService, this.localStorage);
  @ViewChild('cvInput') cvInput: any;
  @ViewChild('jobFinding') jobFinding!: PopupJobFindingComponent;

  cancelLbl = Constants.cancelLbl;
  phoneNumberLbl = Constants.phoneNumberLbl;
  nameLbl = Constants.nameLbl;
  dateOfBirthLbl = Constants.dateOfBirthLbl;
  cv = Constants.CV;
  wardLbl = Constants.wardLbl;
  provinceLbl = Constants.provinceLbl;
  nationalityLbl = Constants.nationalityLbl;
  nationalLbl = Constants.nationalLbl;
  emailLbl = Constants.emailLbl;
  addressLbl = Constants.addressLbl;
  jobTargetLbl = Constants.jobTargetLbl;
  experienceLbl = Constants.experienceLbl;
  activeLbl = Constants.activeLbl;
  provinces: any;
  wards: any;
  isChecked: boolean | true;
  addedUser: any;
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
  isUpdatedSuccessfully: any;
  messageCode: any;
  CONFIRM_UPDATE_CODE = ConstantsApp.CONFIRM_UPDATE_CODE;
  CONFIRM_CREATING_NEW_POST = ConstantsApp.CONFIRM_CREATING_NEW_POST;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  dob: any;
  avatarUrl: string | ArrayBuffer | null = null;
  selectedFile: any;
  upgradePackage: Package;
  user: any;
  role: any;
  recruiterRole: any;
  isDropDownAction: any
  actionMobile: any;
  jobId: number;
  APP_CANDIDATE_ITEMS_LIST: string = ConstantsApp.APP_CANDIDATE_ITEMS_LIST;
  PROFILE_PAGE = ConstantsApp.APP_PROFILE;
  showCVManagePage: boolean;
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
    private exportService: ExportService) {
    this.user = JSON.parse(this.utilsService.getItem(ConstantsApp.user));
    this.role = this.localStorage.getItem(ConstantsApp.role);
    this.recruiterRole = ConstantsApp.RECRUITER;
    this.isChecked = true;
    this.showCVManagePage = false;

  }

  async ngOnInit() {
    console.log('Role:', this.role);
    await this.initData();
  }

  async initData() {
    this.isDropDownAction = false
    this.actionMobile = ConstantsApp.optionActionProfile
    this.genders = [{ code: 1, name: Constants.maleLbl }, { code: 2, name: Constants.femaleLbl }, { code: 3, name: Constants.otherLbl }]
    let item = this.localStorage.getItem(ConstantsApp.user);
    let date = new Date();
    if (item) {
      date = item.birthyear ? new Date(item.birthyear) : item.dateOfBirth ? new Date(item.dateOfBirth) : new Date();
    }
    let dateString = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + date.getDate();
    this.userItem = item ? {
      detailAddress: item.detailAddress,
      addree: item.detailAddress,
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
      recruiterRate: {
        totalCount: 0,
        averageRating: 0,
        rating1Star: 0,
        rating2Star: 0,
        rating3Star: 0,
        rating4Star: 0,
        rating5Star: 0
      }
    } : new User();
    if (this.userItem.avatar != null) {
      this.avatarUrl = `${this.userItem.avatar}`;
    }
    await this.getData();

    this.userItemOrg = { ...this.userItem };
    if (!this.userItem.province) this.userItem.province = 'Hà Nội';
    if (!this.userItem.ward) this.userItem.ward = 'Hoàn Kiếm';
    if (!this.userItem.jobTarget) {
      this.userItem.jobTarget = null;
    }
    if (!this.userItem.experience) {
      this.userItem.experience = null;
    }

    if (this.userItem.phone != this.userItem.email) {
      this.detailUserForm = new FormGroup({
        phone: new FormControl('', [Validators.required, Validators.pattern(this.utilsService.phonePattern)]),
        name: new FormControl(this.userItem.name, [Validators.required]),
        detailAddress: new FormControl(this.userItem.detailAddress, [Validators.required]),
        jobTarget: new FormControl(this.userItem.jobTarget),
        experience: new FormControl(this.userItem.experience),
        birthyear: new FormControl(new Date(this.userItem.dateOfBirth), [Validators.required]),
        email: new FormControl(this.userItem.email, [Validators.required, Validators.pattern(this.utilsService.emailPattern)]),
      });
    } else {
      this.detailUserForm = new FormGroup({
        name: new FormControl(this.userItem.name, [Validators.required]),
        detailAddress: new FormControl(this.userItem.detailAddress, [Validators.required]),
        jobTarget: new FormControl(this.userItem.jobTarget),
        experience: new FormControl(this.userItem.experience),
        birthyear: new FormControl(new Date(this.userItem.dateOfBirth), [Validators.required]),
        email: new FormControl(this.userItem.email, [Validators.required, Validators.pattern(this.utilsService.emailPattern)]),
      });
    }
    console.log(" this.detailUserForm", this.detailUserForm);
    this.checkDisableForm();

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

  isValidDOB(): boolean {
    return this.utilsService.isValidDOB(this.userItem.dateOfBirth);
  }

  saveData(code: any) {
    if (this.modeType == ConstantsApp.CREATE_NEW) {
      this.onCreateUser();
    } else {
      this.openPopupConfirm(code);
    }
  }

  openPopupConfirm(code: any) {
    switch (code) {
      case 1: this.popupConfirmUpdate.openPopup(); this.CONFIRM_UPDATE_CODE = 1; break;
      case 2: this.popupConfirmDeactive.openPopup(); break;
      case 3: this.popupConfirmDelete.openPopup(); break;
    }
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
      let provinceName = this.userItem.province;
      console.log("provinceName: ", provinceName);
      this.selectedProvince = this.utilsService.getAddressByName(this.provinces, provinceName);
      let provinceCode = this.selectedProvince.code;
      this.commonService.getWardsByProvince(provinceCode).subscribe(res => {
        if (res && res.data) {
          let data = res.data;
          if (data)
            this.wards = data;
          let wardName = this.userItem.ward;
          this.selectedWard = this.utilsService.getAddressByName(this.wards, wardName);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
  getData() {
    let apiModels = [
      new ApiModel('get user item', environment.API_URI + ApiNameConstants.BS_USER_SEARCH, { phone: this.userItem.phone }, ConstantsApp.POST),
      new ApiModel('get all province', environment.API_URI + ApiNameConstants.BS_GET_ALL_PROVINCES, null, ConstantsApp.GET),
    ];
    this.commonService
      .retrieveData(apiModels)
      .subscribe(res => {
        if (res && res[0] && res[0].data) {
          let data = res[0].data;
          this.userItem = data ? data : this.userItem;
          this.userItem.dateOfBirth = this.userItem.dateOfBirth ? this.utilsService.formatDate(new Date(this.userItem.dateOfBirth)) : new Date();
        }
        if (res && res[1] && res[1].data) {
          this.provinces = res[1].data;
          if (!this.utilsService.getItem(ConstantsApp.provinces)) {
            this.utilsService.setItem(ConstantsApp.provinces, this.provinces);
          }
        }
        this.userItemOrg = { ...this.userItem };
        this.buildUserInfoForDisplay();
      },
        (error) => {
          console.error('API error:', error);
        });
    if (this.modeType == ConstantsApp.CREATE_NEW) {
      let mapParams = {
        phone: this.userItem.phone
      }
      this.userDetailService.retrieveData(mapParams).subscribe(res => {
        if (res && res[0] && res[0].data) {
          let data = res[0].data;
          this.userItem = data && data[0] ? data[0] : this.userItem;
        }

        if (res && res[1] && res[1].data) {
          this.provinces = res[1].data.data;
          if (!this.utilsService.getItem(ConstantsApp.provinces)) {
            this.utilsService.setItem(ConstantsApp.provinces, this.provinces);
          }
        }

        if (res && res[2] && res[2].data) {
          console.log(res[2].status)
        }
        this.userItemOrg = { ...this.userItem };
        this.buildUserInfoForDisplay();
      });
    } else if (this.modeType == ConstantsApp.UPDATE_USER) {
      let mapParams = {
        phone: this.userItem.phone
      }
      this.userDetailService.retrieveData(mapParams).subscribe(res => {
        if (res && res[0] && res[0].data) {
          let data = res[0].data;
          this.userItem = data && data[0] ? data[0] : this.userItem;
        }
        if (res && res[1] && res[1].data) {
          this.provinces = res[1].data;
          if (!this.utilsService.getItem(ConstantsApp.provinces)) {
            this.utilsService.setItem(ConstantsApp.provinces, this.provinces);
          }
        }

        if (res && res[2] && res[2].data) {
          console.log(res[2].status)
        }
        this.userItemOrg = { ...this.userItem };
        this.buildUserInfoForDisplay();
      });
    }
  }

  /**
  * build data to the selection fields
  * @returns
  */
  buildUserInfoForDisplay() {
    this.getLocation();
    this.dob = new FormControl(new Date(this.userItem.dateOfBirth))
    this.selectedGender = this.utilsService.buildSelectedItem(ConstantsApp.gender, this.genders, this.userItem);
    this.selectedUserType = this.utilsService.buildSelectedItem(ConstantsApp.role, this.userTypes, this.userItem);
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
          this.selectedWard = item.name;
        }
      }
    });
  }

  openPopupConfirmUpgrade(upgradedPackage: any) {
    this.upgradePackage = upgradedPackage;
    this.popupConfirm.openPopup();
  }

  compareOwnPointWithPackagePrice() {
    const functionName = 'upgradeUserToPremium';
    const messageLog = 'upgrade user to premium';

    // Calculate the actual amount based on the package
    let amount = this.upgradePackage.type === 6 ? this.upgradePackage.price * 10000 : this.upgradePackage.price * 1000;

    // Build API URL with query parameters
    let apiUrl = environment.API_URI + ApiNameConstants.BS_USER_UPGRADE_PREMIUM +
      `?amount=${amount}&months=${this.upgradePackage.type}`;

    try {
      this.commonService.postDatas(null, apiUrl, functionName, messageLog).subscribe({
        next: (res) => {
          console.log('=== COMPLETE SERVER RESPONSE ===');
          console.log('Full response:', res);
          console.log('Response type:', typeof res);

          // Log every possible field that might contain the message
          if (res && typeof res === 'object') {
            console.log('res.message:', res.message);
            console.log('res.data:', res.data);
            console.log('res.error:', res.error);
            console.log('res.errorMessage:', res.errorMessage);
            console.log('res.body:', res.body);
            console.log('res.response:', res.response);
            console.log('All keys in response:', Object.keys(res));

            // Log the entire response as JSON string to see structure
            console.log('Response as JSON:', JSON.stringify(res, null, 2));
          }

          // Check if HTTP status code is 200 (success)
          if (res && res.code === 200) {
            // Success
            const currentDate = new Date();
            const premiumExpDate = new Date(currentDate);
            premiumExpDate.setMonth(currentDate.getMonth() + this.upgradePackage.type);
            this.userItem.premiumExpDate = premiumExpDate;

            this.appToast.show({
              messageCode: ConstantsApp.SUCCESS_CODE,
              message: res.message || res.data || 'User upgrade thành công'
            });
          } else {
            // Use res.body for the response message
            const serverMessage = res?.body || res?.data || res?.message || 'Nâng cấp tài khoản thất bại';

            console.log('Using server message:', serverMessage);

            this.appToast.show({
              messageCode: ConstantsApp.FAILED_CODE,
              message: serverMessage
            });
          }
        },
        error: (error) => {
          console.error('Network/HTTP error:', error);

          // Show server's error message if available, otherwise generic message
          const errorMessage = error.error?.message || error.message || 'Có lỗi xảy ra khi nâng cấp';

          this.appToast.show({
            messageCode: ConstantsApp.FAILED_CODE,
            message: errorMessage
          });
        }
      });
    } catch (e) {
      console.log(e);
      this.appToast.show({
        messageCode: ConstantsApp.FAILED_CODE,
        message: 'Đã xảy ra lỗi không mong muốn.'
      });
    }
  }

  addingTransactionHis() {
    let phone = this.user.phone;
    let body = {
      userPhone: phone,
      conversionRate: 1.25,
      transferredMoney: 0,
      transferredPoint: -this.upgradePackage.price,
      otherReason: "Upgrade account in " + this.upgradePackage.type,
      note: "Upgrade account",
      transferType: ConstantsApp.UPGRADE_ACCOUNT
    }
    const functionName = 'addingTransactionHis';
    const messageLog = 'call payment service';
    let apiUrl = environment.API_URI + ApiNameConstants.BS_PAYMENT_TRX_HIS_SAVE;
    try {
      this.commonService.postDatas(body, apiUrl, functionName, messageLog).subscribe(res => {
        if (res && res.data) {

        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  updateWallet(wallet: Wallet) {
    const functionName = 'updateWallet';
    const messageLog = 'call payment service';
    let apiUrl = environment.API_URI + ApiNameConstants.BS_PAYMENT_WALLET_SAVE;
    try {
      this.commonService.postDatas(wallet, apiUrl, functionName, messageLog).subscribe(res => {
        if (res && res.data) {

        }
      });
    } catch (e) {
      console.log(e);
    }

  }
  changePassApiCal(newPassword: string) {
    this.userItem.pin = newPassword;
    this.onUpdateUser(ConstantsApp.CHANGE_PASS);
  }

  onSignOut() {
    this.authService.logout().subscribe((res) => {
      if (res.code == ConstantsApp.SUCCESS_CODE) {
        this.router.navigate(['/app-login']);
      }
    });
  }

  onUpdate() {
    // this.uploadFile();
    this.onUpdateUser(null);
  }

  onUpdateUser(actionType: any) {
    const functionName = 'onUpdateUser';
    const messageLog = 'update a user';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_UPDATE;

    console.log('Sending userItem.avatar to API:', this.userItem.avatar); // Debug

    this.userService
      .postDatas(this.userItem, apiUrl, functionName, messageLog)
      .subscribe(
        (res) => {
          if (res && res.code == ConstantsApp.SUCCESS_CODE) {
            this.localStorage.setItem(ConstantsApp.user, this.userItem);
            this.userItemOrg = { ...this.userItem };
            this.isUpdatedSuccessfully = true;
            this.messageCode = ConstantsApp.SUCCESS_CODE;
            this.appToast.show({ messageCode: this.messageCode, message: 'Cập nhật thông tin thành công' });
            console.log('Updated avatar in DB:', this.userItemOrg.avatar);
            this.uploadAvatar.emit(this.userItemOrg.avatar);
            this.checkDisableForm();
            if (actionType == ConstantsApp.CHANGE_PASS) {
              this.onSignOut();
            }
          } else {
            this.isUpdatedSuccessfully = false;
            this.messageCode = ConstantsApp.FAILED_CODE;
            this.appToast.show({ messageCode: this.messageCode, message: 'Lỗi cập nhật thông tin' });
          }
        },
        (err) => {
          console.error('Error updating user:', err);
          this.isUpdatedSuccessfully = false;
          this.messageCode = ConstantsApp.FAILED_CODE;
          this.appToast.show({ messageCode: this.messageCode, message: 'Lỗi cập nhật thông tin: ' + err.message });
        }
      );
  }
onJobFindingValidate(event: any) {
  // 1. show toast
  this.appToast.show(event);

  // 2. đóng popup
  this.jobFinding?.closePopup();

  // 3. redirect + force reload list
  this.router.navigate(['/candidate/posts'], {
    queryParams: { reload: Date.now() }
  });
}

 openPopupJobFinding() {
  if (!this.jobFindingPopUp) {
    console.error('PopupJobFinding chưa được init');
    return;
  }

this.isDropDownAction = false;
  this.jobFinding.openPopup(ConstantsApp.CREATE_FREELANCER, null);
}

  openPopupUpgradeAccount() { this.popupUpgradeAccount.openPopup(); }
  openPopupChangePassword() { this.popupChangePassword.openPopup(); this.isDropDownAction = false; }
  openPopupCVManagement(open: boolean) { this.showCVManagePage = open; }

  onGenderSelected(genderCode: any) {
    this.userItem.gender = genderCode;
    this.selectedGender = this.utilsService.buildSelectedItem(ConstantsApp.gender, this.genders, this.userItem);
  }

  onProvinceSelected(provinceCode: any) {
    this.province = this.getPositionNameByCode(this.provinces, provinceCode);
    this.userItem.province = this.province;
    this.getWardsByProvince(provinceCode);
  }

  // onDistrictSelected(districtCode: any) {
  //   this.district = this.getPositionNameByCode(this.districts, districtCode);
  //   this.userItem.district = this.district;
  //   this.getWardsByDistrict(districtCode);
  //   console.log(this.userItem.district);
  // }

  onWardSelected(wardCode: any) {
    this.ward = this.getPositionNameByCode(this.wards, wardCode);
    this.userItem.ward = this.ward;
    console.log(this.userItem.ward);
  }
  onAdminTypeSelected(val: any) {
    this.userItem.role = val;
    this.selectedUserType = this.utilsService.buildSelectedItem(ConstantsApp.role, this.userTypes, this.userItem);
  }

  getPositionNameByCode(data: any, code: any) {
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      if (item.code == code) {
        return item.name;
      }
    }
  }

  /**
   * for selection menu -> gender, role
   */
  buildSelectedItem(key: any, items: any) {
    let selectedItem = null;
    if (!this.userItem || !this.userItem[key]) return;
    let val = this.userItem[key];
    for (let i = 0; i < items.length; i++) {
      if (items[i].code == val) {
        selectedItem = items[i];
        break;
      }
    }
    return selectedItem;
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
            // success close popup
            // this.closePopup();
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

  async uploadFile(file: File) {
    if (file) {
      this.fileService.uploadFile(file).subscribe(
        data => {
          // this.uploadAvatar.emit(this.selectedFile.name);
          console.log('uploadFile', data);
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  async onFileSelected(event: any) {
    try {
      this.selectedFile = event.target.files[0] as File;
      if (!this.selectedFile) {
        throw new Error('Không có file được chọn');
      }
      const response = await this.fileService.uploadFile(this.selectedFile).toPromise();
      console.log('Cloudinary response:', JSON.stringify(response, null, 2));
      this.userItem.avatar = response.secure_url; // Lưu secure_url
      this.avatarUrl = response.secure_url; // Hiển thị ảnh
      console.log('userItem.avatar:', this.userItem.avatar);
      console.log('avatarUrl:', this.avatarUrl);
      this.appToast.show({ messageCode: ConstantsApp.SUCCESS_CODE, message: 'Tải ảnh lên thành công' });
      // Gọi onUpdateUser để lưu vào DB
      await this.onUpdateUser(null);
    } catch (err: any) {
      console.error('Error uploading file to Cloudinary:', err);
      this.appToast.show({
        messageCode: ConstantsApp.FAILED_CODE,
        message: err.message || 'Lỗi tải lên ảnh'
      });
    }
  }

  displayImage(file: File) {
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.avatarUrl = event.target.result;
    };
    reader.readAsDataURL(file);
  }
  onOpenActionMobile = () => {
    this.isDropDownAction = !this.isDropDownAction
  }
  onCVSelected(event: any) {
    let functionName = 'onCreateFreelancer';
    let messageLog = 'creating freelancer';
    try {
      let selectedCV = event.target.files[0] as File
      if (selectedCV) {
        let apiUrl = environment.API_URI + ApiNameConstants.BS_USER_FREELANCER_CREATE;
        if (this.selectedWard && this.selectedWard.lat && this.selectedWard.lng) {
          this.userItem.lat = this.selectedWard.lat;
          this.userItem.lng = this.selectedWard.lng;
        }
        console.log('userItem profile:', this.userItem);
        this.userService.postDatas({
          lat: this.userItem.lat,
          lng: this.userItem.lng,
          cv: selectedCV.name
        }, apiUrl, functionName, messageLog)
          .subscribe(res => {
            if (res) {
              if (res.data) {
                let freelancerId = res.data.id;
                let lastIdxOfDot = selectedCV.name.lastIndexOf('.');
                let fileName = selectedCV.name.substring(0, lastIdxOfDot);
                let fileType = selectedCV.name.substring(lastIdxOfDot);
                fileName = freelancerId + '_' + fileName + fileType;
                let newFile = new File([selectedCV], fileName, {
                  type: selectedCV.type,
                });
                this.uploadFile(newFile).then(() => {
                  this.messageCode = ConstantsApp.SUCCESS_CODE;
                  this.appToast.show({ messageCode: this.messageCode });
                  this.cvInput.nativeElement.value = '';
                });
              }
            } else {
              this.messageCode = ConstantsApp.FAILED_CODE;
              this.appToast.show({ messageCode: this.messageCode });
            }
          });
      }
    } catch (err) {
      console.error('Error saving file:', err);
    }
  }
}
