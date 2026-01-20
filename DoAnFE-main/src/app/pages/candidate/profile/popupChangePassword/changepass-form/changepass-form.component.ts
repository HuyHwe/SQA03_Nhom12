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

import { LocalStorageService } from 'src/app/core/auth/local-storage.service';
import {PopupChangePasswordComponent} from '../popup-change-password.component';
@Component({
    selector: 'app-changepass-form',
    templateUrl: './changepass-form.component.html',
    styleUrls: ['./changepass-form.component.scss']
})
// usage
// <app-user-detail isEditMode="true"></app-user-detail>
export class ChangepassForm implements OnInit {
    @Input() userItem: any;
    @Input() isEditMode: any;
    @Input() modeType: any;


    @Input() isRegister: boolean;
    @Input() isLogin: boolean;
    @Input() isForgotPass: boolean;


    @Output() toForgotPass: EventEmitter<any> = new EventEmitter
    @Output() validate = new EventEmitter();
    @Output() cancel = new EventEmitter();
    @Output() newValidPassword = new EventEmitter();
    @ViewChild('appToast') appToast: ToastComponent = new ToastComponent();


    cancelLbl = Constants.cancelLbl;
    phoneNumberLbl = Constants.phoneNumberLbl;
    nameLbl = Constants.nameLbl;
    dateOfBirthLbl = Constants.dateOfBirthLbl;
    accountInfoLbl = Constants.accountInfoLbl;
    saveChangeLbl = Constants.saveChangeLbl;
    loginBtnLbl = Constants.loginBtnLbl;


    cv = Constants.CV;
    wardLbl = Constants.wardLbl;
    provinceLbl = Constants.provinceLbl;
    genderLbl = Constants.genderLBL;
    nationalityLbl = Constants.nationalityLbl;
    nationalLbl = Constants.nationalLbl;
    adminSelectRankLbl = Constants.adminSelectRankLbl;
    emailLbl = Constants.emailLbl;
    addressLbl = Constants.addressLbl;
    jobTargetLbl = Constants.jobTargetLbl;
    experienceLbl = Constants.experienceLbl;
    editLbl = Constants.editLbl;
    deleteAccountLbl = Constants.deleteAccountLbl;
    activeLbl = Constants.activeLbl;
    deactiveLbl = Constants.deactiveLbl;
    introProgramingLbl = Constants.introProgramingLbl;
    forgotPassLbl = Constants.forgotPassLbl;
    invalidPhone = Constants.phoneDNE;
    passLbl = Constants.passLbl;
    wrongPassword: boolean;
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
    userTypes: any;
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
    passIsNull:boolean;
    newPassIsNull:boolean;
    repeatedPassIsNull:boolean;

    loginState: boolean;
    constructor(
        private userService: UserService,
        private mapService: MapService,
        private commonService: CommonService,
        private router: Router,
        private authService: AuthService,
        private route: ActivatedRoute,
        private localStorageService: LocalStorageService,
        private popupChangePassword: PopupChangePasswordComponent,
        private utilsService: UtilsService) {
        this.isChecked = true;
    }

    ngOnInit(): void {
        this.initData();
        this.loginState = true;
        this.wrongPassword = false;
    }
    initData() {
        if (!this.userItem) {
            this.userItem = {
                password: '',
                newPassword: '',
                repeatedPassword: ''
            }
            this.userItemOrg = { ...this.userItem };
        }

        this.detailUserForm = new FormGroup({
            password: new FormControl('',),
            newPassword: new FormControl('',[Validators.pattern(this.utilsService.passwordPattern)]),
            repeatedPassword: new FormControl('', [Validators.pattern(this.utilsService.passwordPattern)])
        });
    }


    get password(): any {
        return this.detailUserForm.get('password');
    }
    get newPassword(): any {
        return this.detailUserForm.get('newPassword');
    }
    get repeatedPassword(): any {
        return this.detailUserForm.get('repeatedPassword');
    }

    closePopup(): void {
        this.popupChangePassword.closePopup();
    }
    changeUserPassword() {
        if(this.userItem.password == null || this.userItem.password == ''){
            this.passIsNull = true;
        } else {this.passIsNull = false}
        if(this.userItem.newPassword == null || this.userItem.newPassword == ''){
            this.newPassIsNull = true;
        } else {this.newPassIsNull = false}
        if (this.userItem.newPassword !== this.userItem.repeatedPassword) {
            return;
        }
        if (this.passIsNull || this.newPassIsNull) return;
        this.newValidPassword.emit(this.utilsService.getValEncode(this.userItem.newPassword));
    }

    redirect() {
        this.router.navigate(['/'])
    }
    gotoForgotPassForm() {
        this.toForgotPass.emit({ isForgotPass: true, isRegister: false, isLogin: false });
    }
}
