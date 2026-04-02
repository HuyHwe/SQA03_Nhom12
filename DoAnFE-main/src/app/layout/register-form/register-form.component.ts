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
import { MapService } from 'src/app/service/map.service';
import { PopupConfirmComponent } from '../popup/popup-confirm/popup-confirm.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-register-form',
    templateUrl: './register-form.component.html',
    styleUrls: ['./register-form.component.scss']
})
// usage
// <app-user-detail isEditMode="true"></app-user-detail>
export class RegisterForm implements OnInit {
    @Input() userItem: any;
    @Input() isEditMode: any;
    @Input() modeType: any;


    @Input() isRegister: boolean;
    @Input() isLogin: boolean;
    @Input() isForgotPass: boolean;


    @Output() toForgotPass: EventEmitter<any> = new EventEmitter
    @Output() toLogin: EventEmitter<any> = new EventEmitter
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
    signUpBtnLbl = Constants.signUpBtnLbl;
    invalidEmail = Constants.invalidEmail;
    emailOrPhoneExistedLbl =Constants.emailOrPhoneExistedLbl;
    nameCantNull = Constants.nameCantNull;
    emailCantNull = Constants.emailCantNull;
    phoneCantNull = Constants.phoneCantNull;
    passwordCantNull = Constants.passwordCantNull;
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
    CONFIRM_UPDATE_CODE = ConstantsApp.CONFIRM_UPDATE_CODE;
    CONFIRM_DEACTIVE_CODE = ConstantsApp.CONFIRM_DEACTIVE_CODE;
    CONFIRM_DELETE_CODE = ConstantsApp.CONFIRM_DELETE_CODE;
    center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
    dob: any;
    roleItem: any;
    emailOrPhoneExisted:boolean;
    emailisNull:boolean;
		organizationisNull:boolean;
    phoneisNull:boolean;
    nameisNull:boolean;
    passwordisNull:boolean;
    bodyOrg: any;
    orgList: any;
    dataSource: any;
    pageMenu: any;
    selectedOrg: any;

    radioItems = [
        {
            label: 'searchJobLbl',
            val: ConstantsApp.CANDIDATE,
            checked: true
        },
        {
            label: 'recruitLbl',
            val: ConstantsApp.RECRUITER,
            checked: false
        }
    ]

    loginState: boolean;
    constructor(
        private userService: UserService,
        private mapService: MapService,
        private router: Router,
        private commonService: CommonService,
        private utilsService: UtilsService) {
        this.isChecked = true;
    }

    ngOnInit(): void {
        this.initData();
        this.loginState = true;
        this.emailOrPhoneExisted = false;
        this.emailisNull = false;
        this.phoneisNull =false;
        this.passwordisNull = false;
		this.organizationisNull=false
        this.roleItem = this.radioItems[0];
    }
    initData() {
        this.pageMenu = 1;
        this.bodyOrg = {
            ids: null,
            name: null,
            paging: {
                page: this.pageMenu,
                size: 10,
            },
        }
        if (this.bodyOrg.ids == null) delete this.bodyOrg.ids;
        if (this.bodyOrg.name == null) delete this.bodyOrg.name;
        const functionName = 'getData';
        const messageLog = 'get list organization';
        const apiUrl = environment.API_URI + ApiNameConstants.BS_SEARCH_ORG;
    this.commonService
      .postDatas(this.bodyOrg, apiUrl, functionName, messageLog)
      .subscribe(
        (res: any) => {
          if (res && res.data) {
            this.orgList = res.data;
            this.dataSource = res;
          } else {
            this.orgList = [];
            this.dataSource = null;
          }
        },
        (error) => {
          console.error('API error:', error);
        }
      );

        this.userItem = {
            phone: '',
            name: '',
            email: '',
            password: '',
			organization:''
        }


        this.detailUserForm = new FormGroup({
            phone: new FormControl('', [Validators.pattern(this.utilsService.phonePattern)]),
            name: new FormControl(''),
            email: new FormControl('', [Validators.pattern(this.utilsService.emailPattern)]),
            password: new FormControl('', Validators.required),
			organization: new FormControl(''),
        });


    }
    get phone(): any {
        return this.detailUserForm.get('phone');
    }

    get email(): any {
        return this.detailUserForm.get('email');
    }
    get name(): any {
        return this.detailUserForm.get('name');
    }
	get organization(): any {
		return this.detailUserForm.get('organization');
	}	
    get password(): any {
        return this.detailUserForm.get('password');
    }
    gotoLoginForm() {
        this.isRegister = false;
        this.isLogin = true;
        this.isForgotPass = false;
      }
    signUpUser() {
        //API here

        if (this.detailUserForm.get('name').value == ""|| this.detailUserForm.get('phone').value == null ){
            this.nameisNull=true;
            return
        } else {
            this.nameisNull=false;
        }
        if (this.detailUserForm.get('email').status == "INVALID" || this.detailUserForm.get('phone').status == "INVALID") {
            return
        }
        if (this.detailUserForm.get('phone').value == ""|| this.detailUserForm.get('phone').value == null ){
            this.phoneisNull=true;
            return
        } else {
            this.phoneisNull=false;
        }
        if (this.detailUserForm.get('email').value == ""|| this.detailUserForm.get('email').value == null ){
            this.emailisNull=true;
            return
        } else {
            this.emailisNull=false;
        }
        if (this.detailUserForm.get('password').value == ""|| this.detailUserForm.get('password').value == null ){
            this.passwordisNull=true;
            return
        } else {
            this.passwordisNull=false;
        }
        if(this.roleItem.checked == false && (this.detailUserForm.get('organization').value == "" || this.detailUserForm.get('organization').value == null)) {
            this.organizationisNull = true;
        } else {
            this.organizationisNull = false;
        }
        if(!this.organizationisNull) {
            let body = {
                name: this.detailUserForm.get("name").value,
                phone: this.detailUserForm.get("phone").value,
                email: this.detailUserForm.get("email").value,
                password: btoa(this.detailUserForm.get("password").value),
                organization: this.detailUserForm.get("organization").value,
                role: this.roleItem.val,
            }
            try {
                this.userService.createUser(body).subscribe(res => {
                    console.log(res);
                    if(res.code == "EXISTED") {
                        this.emailOrPhoneExisted = true;
                    } else {
                        
                        
                        // this.gotoLoginForm();
                        this.toLogin.emit();
                    }
                    //   setInterval(() => {this.showLoading = false;}, 3);
                });
            } catch (e) {
                // console.log('onRegist -> create user: ', e);
    
                // setInterval(() => {this.showLoading = false;}, 3);
            }
        }
        
       
        
    }
    radioOnChecked(item: any) {
        this.roleItem = item;
    }

    onSelectOrg(item: any) {
        this.bodyOrg.ids = item? [item.id]: [];
        this.selectedOrg = this.buildSelectedItem(this.bodyOrg.ids[0], this.orgList);
        this.detailUserForm.get("organization").value = this.selectedOrg.name;
      }
    
      buildSelectedItem(id: any, items: any) {
        let selectedItem = null;
        for (let i = 0; i < items.length; i++) {
          if (items[i].id == id) {
            selectedItem = items[i];
            break;
          }
        }
        return selectedItem;
      }

      refetchScrollMenu(el: any) {
        if(el.paging > this.dataSource.totalPage) {
          return;
        }
        this.pageMenu = el.paging;
        this.bodyOrg.paging.page = this.pageMenu;
        this.refetchData(this.bodyOrg);
      }
    
      refetchData(body: any) {
        if (body.ids == null) delete body.ids;
        if (body.keySearch == null) delete body.name;
        const functionName = 'getData';
        const messageLog = 'get list organization';
        const apiUrl = environment.API_URI + ApiNameConstants.BS_SEARCH_ORG;
        this.commonService
          .postDatas(body, apiUrl, functionName, messageLog)
          .subscribe(
            (res: any) => {
              if (res && res.data) {
                this.orgList = [...this.orgList, ...res.data];
                this.dataSource = res;  
              }
            },
            (error) => {
              console.error('API error:', error);
            }
          );
      }
}   