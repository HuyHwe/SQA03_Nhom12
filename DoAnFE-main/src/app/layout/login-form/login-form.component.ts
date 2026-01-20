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
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss']
})
// usage
// <app-user-detail isEditMode="true"></app-user-detail>
export class LoginForm implements OnInit {
    @Input() userItem: any;
    @Input() isEditMode: any;
    @Input() modeType: any;


    @Input() isRegister: boolean;
    @Input() isLogin: boolean;
    @Input() isForgotPass: boolean;


    @Output() toForgotPass: EventEmitter<any> = new EventEmitter
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
    accountInfoLbl = Constants.accountInfoLbl;
    saveChangeLbl = Constants.saveChangeLbl;
    loginBtnLbl = Constants.loginBtnLbl;
    wrongPassword = Constants.wrongPassword;

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
    center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
    dob: any;

    loginState: boolean;
    showPassword: boolean = false;

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

        if (!this.userItem) {
            this.userItem = {
                phone: '',
                password: ''
            }
            this.userItemOrg = { ...this.userItem };
        }

        this.detailUserForm = new FormGroup({
            phone: new FormControl('', [Validators.pattern(this.utilsService.phonePattern)]),
            password: new FormControl(this.userItem.password),
        });


    }
    get phone(): any {
        return this.detailUserForm.get('phone');
    }

    get password(): any {
        return this.detailUserForm.get('password');
    }

    loginWithCredentials() {

        let credentials = {
            username: this.userItem.phone,
            password: this.utilsService.getValEncode(this.userItem.password),
        }

        this.authService.signIn(credentials).subscribe(res => {

            if (res != "FAILED") {
                this.redirect();
            }

        }, err => {
            this.loginState = false;
        });

    }
    redirect() {
        this.router.navigate(['/'])
    }
    gotoForgotPassForm() {
        this.toForgotPass.emit({ isForgotPass: true, isRegister: false, isLogin: false });


    }
    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    onPasswordInput() {
    }
}
