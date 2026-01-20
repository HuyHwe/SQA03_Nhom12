import { Component, ViewChild, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { UserService } from 'src/app/service/user.service';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { CommonService } from 'src/app/service/common.service';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { FormGroup, FormControl, Validators, EmailValidator } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { UserDetailService } from './user-detail.service';
import { ToastComponent } from 'src/app/layout/toast/toast.component';
import { MapService } from 'src/app/service/map.service';
import { PopupConfirmComponent } from "../popup/popup-confirm/popup-confirm.component";
import { LocalStorageService } from "../../core/auth/local-storage.service";

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})

export class UserDetail implements OnInit {
  @Input() userItem: any;
  @Input() isEditMode: any;
  @Input() modeType: any;

  @Output() validate = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @ViewChild('appToast') appToast: ToastComponent = new ToastComponent();
  @ViewChild('popupConfirmUpdate') popupConfirmUpdate: PopupConfirmComponent = new PopupConfirmComponent();
  @ViewChild('popupConfirmDeactive') popupConfirmDeactive: PopupConfirmComponent = new PopupConfirmComponent();
  @ViewChild('popupConfirmDelete') popupConfirmDelete: PopupConfirmComponent = new PopupConfirmComponent();

  cancelLbl = Constants.cancelLbl;
  phoneNumberLbl = Constants.phoneNumberLbl;
  nameLbl = Constants.nameLbl;
  dateOfBirthLbl = Constants.dateOfBirthLbl;

  cv = Constants.CV;
  wardLbl = Constants.wardLbl;
  provinceLbl = Constants.provinceLbl;
  genderLbl = Constants.genderLBL;
  nationalityLbl = Constants.nationalityLbl;
  emailLbl = Constants.emailLbl;
  addressLbl = Constants.addressLbl;
  jobTargetLbl = Constants.jobTargetLbl;
  activeLbl = Constants.activeLbl;

  role: any;
  inputRoleVal: any;
  formData: any;
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
  selectedUserType: any;
  selectedGender: any;
  userItemOrg: any;
  isUpdatedSuccessfully: any;
  messageCode: any;
  CONFIRM_UPDATE_CODE = ConstantsApp.CONFIRM_UPDATE_CODE;
  CONFIRM_DEACTIVE_CODE = ConstantsApp.CONFIRM_DEACTIVE_CODE;
  CONFIRM_DELETE_CODE = ConstantsApp.CONFIRM_DELETE_CODE;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  dob: any;
  constructor(
    private userService: UserService,
    private mapService: MapService,
    private userDetailService: UserDetailService,
    private commonService: CommonService,
    private utilsService: UtilsService,
    private localStorageService: LocalStorageService
  ) {
    this.isChecked = true;
  }

  ngOnInit(): void {
    this.initData();
  }
  initData() {
    this.genders = [{ code: 1, name: Constants.maleLbl }, { code: 2, name: Constants.femaleLbl }, { code: 3, name: Constants.otherLbl }]
    let item = this.localStorageService.getItem(ConstantsApp.user);
    let date = new Date(item.birthyear);
    let dateString = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + date.getDate();
    this.userItem = {
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
      country: 'Việt Nam',
      detailAddress: item.detailAddress,
      nationality: 'Việt Nam',
      experience: item.experience,
      province: item.province ? item.province : 'Hà Nội',
      ward: item.ward ? item.ward : ''
    };
    this.getData();
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
      phone: new FormControl('', [Validators.required, Validators.pattern(this.utilsService.phonePattern)]),
      name: new FormControl(this.userItem.name, [Validators.required]),
      address: new FormControl(this.userItem.address, [Validators.required]),
      jobTarget: new FormControl(this.userItem.jobTarget),
      experience: new FormControl(this.userItem.experience),
      birthyear: new FormControl(this.userItem.birthyear, [Validators.required]),
      email: new FormControl(this.userItem.email, [Validators.required, Validators.pattern(this.utilsService.emailPattern)]),
    });
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
    return this.detailUserForm.get('address');
  }
  get birthyear(): any {
    return this.detailUserForm.get('birthyear');
  }

  saveData(code: any) {
    if (this.modeType == ConstantsApp.CREATE_NEW) {
      this.onCreateUser()
    } else {
      this.onUpdateUser();
    }
  }

  onEditMode() {
    this.isEditMode = true;
    this.checkDisableForm();
  }

  onCancel() {
    if (this.modeType == ConstantsApp.CREATE_NEW) {
      this.userItem = { ...this.userItemOrg };
      this.buildUserInfoForDisplay();
    } else {
      this.isEditMode = false;
      this.checkDisableForm();
      this.userItem = { ...this.userItemOrg };
      this.buildUserInfoForDisplay();
      this.cancel.emit()
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
    /*this.mapService.getPosition().then(pos=>
      {
        this.center = {lat: pos.lat , lng: pos.lng};
      });*/
    let address = {
      province: 'Hà Nội',
      ward: 'Hoàn Kiếm',
      addressDetail: null
    }
    this.utilsService.setItem(ConstantsApp.address, address);
    this.retrieveAdress();

  }
  /**
   * build data to the address fields
   * @returns
   */
  retrieveAdress() {
    try {
      let provinceName = this.userItem.province;
      console.log('provinceName: ' + provinceName + "...." + this.provinces);
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
        if (!JSON.parse(this.utilsService.getItem(ConstantsApp.provinces))) {
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
          this.selectedWard = item.name;
        }
      }
    });
  }

  onUpdateUser() {
    // todo API
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
          this.localStorageService.setItem(ConstantsApp.user, this.userItemOrg);
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
    this.province = this.getPositionNameByCode(this.provinces, provinceCode);
    this.userItem.province = this.province;
    this.getWardsByProvince(provinceCode);
  }

  // onDistrictSelected(districtCode: any) {
  //   this.district = this.getPositionNameByCode(this.districts, districtCode);
  //   this.userItem.district = this.district;
  //   this.getWardsByDistrict(districtCode);
  // }

  onWardSelected(wardCode: any) {
    this.ward = this.getPositionNameByCode(this.wards, wardCode);
    this.userItem.ward = this.ward;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.formData = new FormData();
      this.formData.append("file", file, file.name);
    }
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

}
