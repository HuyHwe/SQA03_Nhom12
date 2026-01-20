import { Component, ViewChild, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { UserService } from 'src/app/service/user.service';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { CommonService } from 'src/app/service/common.service';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { FormGroup, FormControl, Validators, EmailValidator } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { ToastComponent } from 'src/app/layout/toast/toast.component';
import { PopupConfirmComponent } from 'src/app/pages/form/popup-confirm/popup-confirm.component';
import { ApiModel } from "../../../../model/ApiModel";
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-recruitment-detail',
  templateUrl: './recruitment-detail.component.html',
  styleUrls: ['./recruitment-detail.component.scss']
})

export class RecruitmentDetail implements OnInit {
  @Input() item: any;
  @Input() isEditMode: any;
  @Input() modeType: any;
  @Input() jobDefaultId: any;
  @Output() validate = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() back = new EventEmitter();
  @ViewChild('appToast') appToast: ToastComponent = new ToastComponent();
  @ViewChild('popupConfirmUpdate') popupConfirmUpdate: PopupConfirmComponent = new PopupConfirmComponent();
  @ViewChild('popupConfirmDeactive') popupConfirmDeactive: PopupConfirmComponent = new PopupConfirmComponent();
  @ViewChild('popupConfirmDelete') popupConfirmDelete: PopupConfirmComponent = new PopupConfirmComponent();
  expirationDateLbl = Constants.expirationDateLbl;
  cancelLbl = Constants.cancelLbl;
  phoneNumberLbl = Constants.phoneNumberLbl;
  nameLbl = Constants.nameLbl;
  cv = Constants.CV;
  wardLbl = Constants.wardLbl;
  provinceLbl = Constants.provinceLbl;
  addressLbl = Constants.addressLbl;
  desJobLbl = Constants.desJobLbl;
  workingTypeLbl = Constants.workingTypeLbl;
  activeLbl = Constants.activeLbl;
  creationDateLbl = Constants.creationDateLbl;
  role: any;
  provinces: any;
  wards: any;
  genders: any;
  detailJobForm: any;
  province: any;
  ward: any;
  selectedProvince: any;
  selectedWard: any;
  selectedGender: any;
  selectedWorkingType: any;
  selectedStatus: any;
  selectedJobDefault: any;
  workingTypes: any;
  statusList: any;
  messageCode: any;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  itemOrg: any;
  isAllowChangeJobDefault: boolean = true;
  bodyGetJobDefault: any;
  dataSource: any;
  pageMenu: any;
  jobDefaults: any;
  bodyGetJobPosts: any;
  jobPosts: any;
  constructor(
    private userService: UserService,
    private commonService: CommonService,
    private utilsService: UtilsService) {
  }

  ngOnInit(): void {
    this.initData();
  }
  initData() {
    this.pageMenu = 1;
    if (!this.item) {
      this.item = {
        name: '',
        jobDefaultId: this.jobDefaultId,
        phone: '',
        des: '',
        salary: '',
        address: '',
        province: 'Hà Nội',
        expDate: this.utilsService.formatDate(new Date()),
        ward: 'Hoàn Kiếm',
        workingType: '',
        status: '',
        profit: '',
        requiredSkill: '',
        number: 1,
        creationDate: this.utilsService.formatDate(new Date())
      };
      this.getData();
      // this.getDataJob();
    } else {
      if (!this.item.province) this.item.province = 'Hà Nội';
      if (!this.item.ward) this.item.ward = 'Hoàn Kiếm';
      this.getData();
      // this.getDataJob();
    }

    this.workingTypes = [
      {
        code: ConstantsApp.FULL_TIME,
        name: Constants.fullTimeLbl,
      },
      {
        code: ConstantsApp.PART_TIME,
        name: Constants.partTimeLbl,
      }
    ]
    this.statusList = [
      {
        code: ConstantsApp.IN_ACTIVE,
        name: Constants.inActiveLbl,
      },
      {
        code: ConstantsApp.ACTIVE,
        name: Constants.activeLbl,
      }
    ]
    this.detailJobForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.pattern(this.utilsService.phonePattern)]),
      address: new FormControl(this.item.address, [Validators.required]),
      province: new FormControl(this.item.province, [Validators.required]),
      ward: new FormControl(this.item.ward, [Validators.required]),
      des: new FormControl(this.item.des),
      salary: new FormControl(this.item.salary, [Validators.required, Validators.pattern(this.utilsService.numberPattern)]),
      creationDate: new FormControl(this.item.creationDate),
      expDate: new FormControl(this.item.expDate),
      requiredSkill: new FormControl(this.item.requiredSkill),
      profit: new FormControl(this.item.profit),
      number: new FormControl(this.item.profit, [Validators.pattern(this.utilsService.numberPattern)]),
    });
    this.checkDisableForm();
  }
  get number(): any {
    return this.detailJobForm.get('number');
  }
  get requiredSkill(): any {
    return this.detailJobForm.get('requiredSkill');
  }
  get profit(): any {
    return this.detailJobForm.get('profit');
  }
  get phone(): any {
    return this.detailJobForm.get('phone');
  }
  get salary(): any {
    return this.detailJobForm.get('salary');
  }
  get name(): any {
    return this.detailJobForm.get('name');
  }
  get job(): any {
    return this.detailJobForm.get('job');
  }
  get des(): any {
    return this.detailJobForm.get('des');
  }
  get address(): any {
    return this.detailJobForm.get('address');
  }
  get expDate(): any {
    return this.detailJobForm.get('expDate');
  }
  get creationDate(): any {
    return this.detailJobForm.get('creationDate');
  }

  openPopupConfirm(code: any) {
    switch (code) {
      case 1: this.popupConfirmUpdate.openPopup(); break;
      case 2: this.popupConfirmDeactive.openPopup(); break;
      case 3: this.popupConfirmDelete.openPopup(); break;
    }
  }

  onEditMode() {
    this.isEditMode = true;
    this.checkDisableForm();
  }

  onCancel() {
    if (this.modeType == ConstantsApp.CREATE_NEW) {
      this.buildUserInfoForDisplay();
    } else {
      this.isEditMode = false;
      this.checkDisableForm();
      this.buildUserInfoForDisplay();
      this.cancel.emit()
    }
  }

  checkDisableForm() {
    if (!this.isEditMode) {
      this.detailJobForm.disable();
    } else {
      this.detailJobForm.enable();
    }
  }

  getLocation() {
    this.retrieveAddress();
  }
  /**
   * build data to the address fields
   * @returns
   */
  retrieveAddress() {
    try {
      let provinceName = this.item.province;
      this.selectedProvince = this.utilsService.getAddressByName(this.provinces, provinceName);
      let provinceCode = this.selectedProvince.code;
      this.commonService.getWardsByProvince(provinceCode).subscribe(res => {

        if (res && res.data) {
          let data = res.data;
          if (data)
            this.wards = data;
          let wardName = this.item.ward;
          this.selectedWard = this.utilsService.getAddressByName(this.wards, wardName);

        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  getData() {
    this.bodyGetJobDefault = {
      // levels: [0],
      paging: {
        page: 1,
        size: 100,
      },
    };
    let apiModels = [
      new ApiModel('get all province', environment.API_URI + ApiNameConstants.BS_GET_ALL_PROVINCES, null, ConstantsApp.GET),
    ];
    if (this.utilsService.isEmpty(this.jobDefaultId)) {
      apiModels.push(new ApiModel('get list job children', environment.API_URI + ApiNameConstants.BS_LIST_JOBDEFAULT_REMAIN, this.bodyGetJobDefault, ConstantsApp.POST));
      this.isAllowChangeJobDefault = true;
    } else {
      this.isAllowChangeJobDefault = false;
    }
    if (this.item && this.item.id != null) {
      apiModels.push(new ApiModel('get job item', environment.API_URI + ApiNameConstants.BS_JOB_GET_BY_ID + '?id=' + this.item.id, null, ConstantsApp.GET))
    }
    this.commonService
      .retrieveData(apiModels)
      .subscribe(res => {
        if (res && res[0] && res[0].data) {
          this.provinces = res[0].data;
          if (!this.utilsService.getItem(ConstantsApp.provinces)) {
            this.utilsService.setItem(ConstantsApp.provinces, this.provinces);
          }
        }
        if (res && res[1] && res[1].data) {
          this.jobDefaultId = res[1].data;
          this.dataSource = res[1];
          this.selectedJobDefault = this.jobDefaultId[0];
          this.item.jobDefaultId = this.selectedJobDefault.id;
        }
        if (res && res[2] && res[2].data) {
          this.item = res[2].data;
          this.itemOrg = res[2].data;
          if (this.item.creationDate) this.item.creationDate = this.utilsService.formatDate(new Date(this.item.creationDate));
          if (this.item.expDate) this.item.expDate = this.utilsService.formatDate(new Date(this.item.expDate));
          this.selectedJobDefault = this.item.jobDefault;
          this.selectedWorkingType = this.utilsService.buildSelectedItem(ConstantsApp.workingType, this.workingTypes, this.item);
          this.item.jobDefaultId = this.item.jobDefault.id;
        }
        this.buildUserInfoForDisplay();
      },
        (error) => {
          console.error('API error:', error);
        });
  }

  /**
  * build data to the selection fields
  * @returns
  */
  buildUserInfoForDisplay() {
    this.getLocation();
    this.selectedGender = this.utilsService.buildSelectedItem(ConstantsApp.gender, this.genders, this.item);
  }

  // getDistrictsByProvince(provinceCode: any) {
  //     this.commonService.getDistrictsByProvince(provinceCode).subscribe(res => {
  //         if (res && res.data) {
  //             let data = res.data;
  //             if (data) {
  //                 this.districts = data;
  //                 let item = this.districts[0];
  //                 let code = item.code;
  //                 this.item.district = item.name;
  //                 this.selectedDistrict = item.name;
  //                 this.getWardsByDistrict(code);
  //             }
  //         }
  //     });
  // }

  getWardsByProvince(provinceCode: any) {
    this.commonService.getWardsByProvince(provinceCode).subscribe(res => {
      if (res && res.data) {
        let data = res.data;
        if (data) {
          this.wards = data;
          let item = this.wards[0];
          this.item.ward = item.name;
          this.selectedWard = item;
        }
      }
    });
  }

  onGenderSelected(genderCode: any) {
    this.item.gender = genderCode;
    this.selectedGender = this.utilsService.buildSelectedItem(ConstantsApp.gender, this.genders, this.item);
  }

  onProvinceSelected(provinceCode: any) {
    let province = this.getNameByCode(this.provinces, provinceCode);
    this.province = province.name;
    this.item.province = this.province;
    this.getWardsByProvince(provinceCode);
  }
  onJobDefaultSelected(item: any) {
    this.item.jobDefaultId = item?.id;
    this.selectedJobDefault = item;
  }

  // onDistrictSelected(districtCode: any) {
  //     let district = this.getNameByCode(this.districts, districtCode);
  //     this.district = district.name;
  //     this.item.district = this.district;
  //     this.getWardsByDistrict(districtCode);
  //     if (this.wards && this.wards.length > 0) {
  //       this.selectedWard = this.wards[0].code; // Assuming your wards have a 'code' property
  //       this.onWardSelected(this.selectedWard);
  //     }
  // }

  onWardSelected(wardCode: any) {
    let ward = this.getNameByCode(this.wards, wardCode);
    this.ward = ward.name;
    this.item.ward = this.ward;
    this.selectedWard = ward;
  }

  onWorkingTypeSelected(code: any) {
    this.item.workingType = code;
    this.selectedWorkingType = this.utilsService.buildSelectedItem(ConstantsApp.workingType, this.workingTypes, this.item);
  }

  onStatusSelected(code: any) {
    this.item.status = code;
    this.selectedStatus = this.utilsService.buildSelectedItem(ConstantsApp.status, this.statusList, this.item);
  }
  getNameByCode(data: any, code: any) {
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      if (item.code == code) {
        return item;
      }
    }
  }

  onDelete() {
    this.itemOrg.active = 0;
    this.onSave(true);
  }

  onSave(deactive: boolean) {
    if (this.item.jobDefaultId == null) {
      this.item.jobDefaultId = this.item.jobDefault.id;
    }
    let functionName = 'onCreateItem';
    let messageLog = 'creating a job';
    let toastMessageCode = '';
    let apiUrl = environment.API_URI + ApiNameConstants.BS_SAVE_JOB;
    if (deactive) {
      this.item = { ...this.itemOrg };
    }
    this.item.expDate = this.utilsService.formatLocalDateTime(new Date(this.item.expDate));
    this.item.creationDate = this.utilsService.formatLocalDateTime(new Date(this.item.creationDate));
    if (this.selectedWard && this.selectedWard.lat && this.selectedWard.lng) {
      this.item.lat = this.selectedWard.lat;
      this.item.lng = this.selectedWard.lng;
    }
    try {
      if(this.item.workingType == null || this.item.workingType == '') {
        this.item.workingType = ConstantsApp.FULL_TIME;
      }
      console.log("item recruitment: ", this.item);
      this.userService.postDatas(this.item, apiUrl, functionName, messageLog)
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
    }
  }
  onBack() {
    this.back.emit();
  }
  refetchSelectMenu(el: any) {
    if (this.bodyGetJobDefault) {
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
            this.jobDefaultId = [...this.jobDefaultId, ...res.data];
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
