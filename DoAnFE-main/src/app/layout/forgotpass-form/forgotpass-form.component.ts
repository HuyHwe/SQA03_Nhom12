import { Component, ViewChild, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { UserService } from 'src/app/service/user.service';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { CommonService } from 'src/app/service/common.service';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { FormGroup, FormControl, Validators, EmailValidator } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { ToastComponent } from 'src/app/layout/toast/toast.component';
import { MapService } from 'src/app/service/map.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { PopupConfirmComponent } from '../popup/popup-confirm/popup-confirm.component';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';

@Component({
    selector: 'app-forgotpass-form',
    templateUrl: './forgotpass-form.component.html',
    styleUrls: ['./forgotpass-form.component.scss']
})
// usage
// <app-user-detail isEditMode="true"></app-user-detail>
export class ForgotPassForm implements OnInit {
    @Input() userItem: any;
    @Input() isEditMode: any;
    @Input() modeType: any;


    @Input() isRegister: boolean;
    @Input() isLogin: boolean;
    @Input() isForgotPass: boolean;



    @Output() toForgotPass: EventEmitter<any> = new EventEmitter
    @Output() validate = new EventEmitter();
    @Output() cancel = new EventEmitter();
    @Output() changePassSuccess = new EventEmitter();
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
    nationalityLbl = Constants.nationalityLbl;
    emailLbl = Constants.emailLbl;
    addressLbl = Constants.addressLbl;
    jobTargetLbl = Constants.jobTargetLbl;
    experienceLbl = Constants.experienceLbl;
    activeLbl = Constants.activeLbl;
    invalidPhone = Constants.phoneDNE;
    getBackPassLbl = Constants.getBackPassLbl;
    phoneCantNull = Constants.phoneCantNull;

    role: any;
    provinces: any;
    wards: any;
    isChecked: boolean | true;
    genders: any;
    detailUserForm: any;
    province: any;
    ward: any;
    selectedProvince: any;
    selectedWard: any;
    selectedGender: any;
    userItemOrg: any;
    messageCode: any;
    center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
    phoneIsNull: boolean;
    loginState: boolean;
    isChangedSuccessfully: boolean | true;
    constructor(
        private userService: UserService,
        private mapService: MapService,
        private commonService: CommonService,
        private router: Router,
        private authService: AuthService,
        private route: ActivatedRoute,
        private localStorageService: LocalStorageService,
        private utilsService: UtilsService) {
        this.isChecked = true;
    }

    ngOnInit(): void {
        this.initData();
        this.loginState = true;
    }
    initData() {
      this.isChangedSuccessfully = true;
      this.phoneIsNull = false;
      if (!this.userItem) {
          this.userItem = {
              phone: '',
          }
          this.userItemOrg = { ...this.userItem };
      }
      this.detailUserForm = new FormGroup({
          phone: new FormControl('', [Validators.pattern(this.utilsService.phonePattern)]),
      });
    }

    get phone(): any {
        return this.detailUserForm.get('phone');
    }

    changePassWithPhone() {
        console.log('changePassWithPhone');
        if (this.detailUserForm.get('phone').value == "" || this.detailUserForm.get('phone').value == null) {
            this.phoneIsNull = true;
            return
        } else {
            this.phoneIsNull = false;
        }
        let body = {
            phone: this.userItem.phone,
        }
        const functionName = 'changePassWithPhone';
        const messageLog = 'Change pass';
        let apiUrl = environment.API_URI + ApiNameConstants.BS_USER_FORGET_PASS;
        try {
            this.commonService.postDatas(body, apiUrl, functionName, messageLog).subscribe(res => {
            if (res && res.code === '200') {
              this.changePassState();
              this.isChangedSuccessfully = true;
            } else {
              this.isChangedSuccessfully = false;
            }
          });
        } catch(e) {
          console.log(e);
          this.isChangedSuccessfully = false;
        }
    }

    redirect() {
        this.router.navigate(['/'])
    }
    gotoForgotPassForm() {
        this.toForgotPass.emit({ isForgotPass: true, isRegister: false, isLogin: false });
    }
    changePassState() {
        this.changePassSuccess.emit({ passState: true });
    }
}
