import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilsService } from '../../../../helper/service/utils.service';
import { ConstantsApp } from '../../../../constant/ConstantsApp';
import { Constants } from '../../../../constant/Constants';
import { CommonService } from '../../../../service/common.service';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from '../../../../constant/ApiNameConstants';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-popup-referral',
  templateUrl: './popup-referral.component.html',
  styleUrls: ['./popup-referral.component.scss'],
})
export class PopupReferralComponent implements OnInit {
  @Output() validate = new EventEmitter();
  @Input() confirmCode: any;
  inforForm: any;
  userItem: any;
  selectedGender: any;
  genders: any;
  selectedProvince: any;
  selectedWard: any;
  province: any;
  ward: any;
  provinces: any[] = [];
  wards: any[] = [];
  isShowTarget: any;
  roleItem: any;
  radioItems: any;

  constructor(
    private commonService: CommonService,
    private utilsService: UtilsService
  ) { }

  ngOnInit(): void {
    this.closePopup();
    this.init();
  }

  get phone(): any {
    return this.inforForm.get('phone');
  }
  get salary(): any {
    return this.inforForm.get('salary');
  }
  get strength(): any {
    return this.inforForm.get('strength');
  }
  get name(): any {
    return this.inforForm.get('name');
  }
  get job(): any {
    return this.inforForm.get('job');
  }
  get des(): any {
    return this.inforForm.get('des');
  }
  get email(): any {
    return this.inforForm.get('email');
  }
  get address(): any {
    return this.inforForm.get('address');
  }
  get dateOfBirth(): any {
    return this.inforForm.get('dateOfBirth');
  }

  init() {
    this.genders = [
      { code: 1, name: Constants.maleLbl },
      { code: 2, name: Constants.femaleLbl },
      { code: 3, name: Constants.otherLbl }
    ];
    this.userItem = {
      address: '',
      phone: '',
      name: '',
      job: '',
      dateOfBirth: '',
      des: '',
      salary: '',
      cv: '',
      img: '',
      lat: '',
      lg: '',
      gender: 1,
      role: 3,
      introPhone: '',
      jobTarget: '',
      country: 'Việt Nam',
      nationality: 'Việt Nam',
      experience: '',
      province: 'Hà Nội',
      ward: 'Hoàn Kiếm'
    };
    this.inforForm = new FormGroup({
      phone: new FormControl(this.userItem.phone, [Validators.required, Validators.pattern(this.utilsService.phonePattern)]),
      name: new FormControl(this.userItem.name, [Validators.required]),
      address: new FormControl(this.userItem.address, [Validators.required]),
      jobTarget: new FormControl(this.userItem.jobTarget),
      experience: new FormControl(this.userItem.experience),
      dateOfBirth: new FormControl(this.userItem.dateOfBirth, [Validators.required]),
      email: new FormControl(this.userItem.email, [Validators.required, Validators.pattern(this.utilsService.emailPattern)]),
    });
    this.isShowTarget = true;
    this.radioItems = [
      {
        label: Constants.searchJobLbl,
        val: ConstantsApp.CANDIDATE,
        checked: true
      },
      {
        label: Constants.recruitLbl,
        val: ConstantsApp.RECRUITER,
        checked: false
      }
    ];
    this.roleItem = {
      label: Constants.searchJobLbl,
      val: ConstantsApp.CANDIDATE,
      checked: true
    };
    this.getData();
  }

  openPopup() {
    document.body.classList.add('no-scroll');
    $('#popup-referral .modal').removeClass('hide');
    $('#popup-referral .modal').addClass('display');
    this.init();
  }

  closePopup() {
    document.body.classList.remove('no-scroll');
    $('#popup-referral .modal').removeClass('display');
    $('#popup-referral .modal').addClass('hide');
  }

  onValidate() {
    this.closePopup();
  }

  onGenderSelected(genderCode: any) {
    this.userItem.gender = genderCode;
    this.selectedGender = this.utilsService.buildSelectedItem(ConstantsApp.gender, this.genders, this.userItem);
  }

  async getData() {
    if (!this.utilsService.isEmpty(this.utilsService.getItem(ConstantsApp.provinces))) {
      this.provinces = this.utilsService.getItem(ConstantsApp.provinces);
      await this.retrieveAdress();
      return;
    }
    try {
      const res = await firstValueFrom(this.commonService.getAllProvince());
      console.log('Provinces API response:', res);
      if (res && Array.isArray(res.data)) {
        // Filter out invalid items
        this.provinces = res.data.filter((item: { name: any; code: any; }) => item && typeof item.name === 'string' && item.code);
        this.utilsService.setItem(ConstantsApp.provinces, this.provinces);
        if (this.provinces.length === 0) {
          this.showToast('Danh sách tỉnh/thành phố rỗng hoặc không hợp lệ');
          return;
        }
        await this.retrieveAdress();
      } else {
        console.error('Invalid provinces data:', res);
        this.showToast('Không lấy được danh sách tỉnh/thành phố');
      }
    } catch (err) {
      console.error('Error fetching provinces:', err);
      this.showToast('Lỗi khi lấy danh sách tỉnh/thành phố: ');
    }
  }

  async retrieveAdress() {
    try {
      console.log('Starting retrieveAdress, provinces:', this.provinces);
      if (!this.provinces || this.provinces.length === 0) {
        return;
      }
      this.selectedProvince = this.utilsService.getAddressByName(this.provinces, this.userItem.province) || this.provinces[0];
      if (!this.selectedProvince) {
        console.warn('Province not found, using default:', this.userItem.province);
        this.selectedProvince = this.provinces[0];
      }
      this.userItem.province = this.selectedProvince.name;
      const provinceCode = this.selectedProvince.code;
      console.log('provinceCode:', provinceCode);
      const wardRes = await firstValueFrom(this.commonService.getWardsByProvince(provinceCode));
      console.log('wardRes:', wardRes);
      if (wardRes && Array.isArray(wardRes.data)) {
        this.wards = wardRes.data.filter((item: { name: any; code: any; }) => item && typeof item.name === 'string' && item.code);
        console.log('Filtered wards:', this.wards);
        if (this.wards.length === 0) {
          return;
        }
        this.selectedWard = this.utilsService.getAddressByName(this.wards, this.userItem.ward) || this.wards[0];
        if (!this.selectedWard) {
          console.warn('Ward not found, using default:', this.userItem.ward);
          this.selectedWard = this.wards[0];
        }
        this.userItem.ward = this.selectedWard.name;
      } else {
        console.error('Invalid wards data:', wardRes);
        this.wards = [];
      }

    } catch (e) {
      console.error('Error in retrieveAdress:', e);
      this.showToast('Lỗi khi tải dữ liệu địa chỉ: ');
    }
  }

  getPositionNameByCode(data: any[], code: any): string | undefined {
    return data?.find(item => item && item.code == code)?.name;
  }

  // async getDistrictsByProvince(provinceCode: any) {
  //   try {
  //     const res = await firstValueFrom(this.commonService.getDistrictsByProvince(provinceCode));
  //     console.log('Districts API response:', res);
  //     if (res && Array.isArray(res.data)) {
  //       this.districts = res.data.filter((item: { name: any; code: any; }) => item && typeof item.name === 'string' && item.code);
  //       console.log('Filtered districts:', this.districts);
  //       if (this.districts.length === 0) {
  //         this.showToast('Danh sách quận/huyện rỗng hoặc không hợp lệ');
  //         return;
  //       }
  //       this.selectedDistrict = this.districts[0];
  //       this.userItem.district = this.selectedDistrict.name;
  //       await this.getWardsByDistrict(this.selectedDistrict.code);
  //     } else {
  //       console.error('Invalid districts data:', res);
  //       this.showToast('Không lấy được danh sách quận/huyện');
  //       this.districts = [];
  //     }
  //   } catch (err) {
  //     console.error('Error fetching districts:', err);
  //     this.showToast('Lỗi khi lấy danh sách quận/huyện: ');
  //     this.districts = [];
  //   }
  // }

  async getWardsByProvince(provinceCode: any) {
    try {
      const res = await firstValueFrom(this.commonService.getWardsByProvince(provinceCode));
      console.log('Wards API response:', res);
      if (res && Array.isArray(res.data)) {
        this.wards = res.data.filter((item: { name: any; code: any; }) => item && typeof item.name === 'string' && item.code);
        console.log('Filtered wards:', this.wards);
        if (this.wards.length === 0) {
          this.showToast('Danh sách phường/xã rỗng hoặc không hợp lệ');
          return;
        }
        this.selectedWard = this.wards[0];
        this.userItem.ward = this.selectedWard.name;
      } else {
        console.error('Invalid wards data:', res);
        this.showToast('Không lấy được danh sách phường/xã');
        this.wards = [];
      }
    } catch (err) {
      console.error('Error fetching wards:', err);
      this.showToast('Lỗi khi lấy danh sách phường/xã: ');
      this.wards = [];
    }
  }

  onProvinceSelected(provinceCode: any) {
    this.province = this.getPositionNameByCode(this.provinces, provinceCode);
    this.userItem.province = this.province;
    this.wards = [];
    this.selectedWard = null;
    this.userItem.ward = '';
    this.getWardsByProvince(provinceCode);
  }

  // onDistrictSelected(districtCode: any) {
  //   this.district = this.getPositionNameByCode(this.districts, districtCode);
  //   this.userItem.district = this.district;
  //   this.wards = [];
  //   this.selectedWard = null;
  //   this.userItem.ward = '';
  //   this.getWardsByDistrict(districtCode);
  // }

  onWardSelected(wardCode: any) {
    this.ward = this.getPositionNameByCode(this.wards, wardCode);
    this.userItem.ward = this.ward;
  }

  async onCreateUser() {
    let functionName = 'onCreateUser';
    let messageLog = 'creating freelancer';
    let toastMessageCode = '';
    let apiUrl = environment.API_URI + ApiNameConstants.BS_USER_CREATE;
    let userLogin = JSON.parse(this.utilsService.getItem(ConstantsApp.user));
    this.userItem.introPhone = userLogin.phone;
    this.userItem.role = this.roleItem.val;
    try {
      const res = await firstValueFrom(this.commonService.postDatas(this.userItem, apiUrl, functionName, messageLog));
      if (res && res.code === ConstantsApp.SUCCESS_CODE) {
        toastMessageCode = ConstantsApp.SUCCESS_CODE;
      } else if (res && res.code === ConstantsApp.EXISTED) {
        toastMessageCode = ConstantsApp.EXISTED;
      } else {
        toastMessageCode = ConstantsApp.NOT_MODIFIED_CODE;
      }
      this.validate.emit(toastMessageCode);
      this.closePopup();
    } catch (error) {
      console.error('onCreateUser error:', error);
      this.showToast('Lỗi khi tạo người dùng: ');
    }
  }

  radioOnChecked(item: any) {
    this.roleItem = item;
    this.isShowTarget = !this.isShowTarget;
    console.log('isShowTarget:', this.isShowTarget, 'roleItem:', this.roleItem);
  }


  isValidDOB(): boolean {
    return this.utilsService.isValidDOB(this.userItem.dateOfBirth);
  }

  showToast(message: string) {

  }
}