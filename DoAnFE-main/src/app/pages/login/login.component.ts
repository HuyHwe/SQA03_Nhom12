import { HostListener, Component, Inject, OnInit } from '@angular/core';
import { InputItem } from 'src/app/model/inputItem';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { UserService } from 'src/app/service/user.service';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginQuote = Constants.loginQuote;
  otherLoginOptionLbl = Constants.otherLoginOptionLbl;
  changePassLbl = Constants.changePassLbl;
  isHasntAccountQuestion = Constants.isHasntAccountQuestion;
  isHadAccountQuestion = Constants.isHadAccountQuestion;
  registerNamePlaceholder = Constants.registerNamePlaceholder;
  registerEmailPlaceholder = Constants.registerEmailPlaceholder;
  registerQuote = Constants.registerQuote;
  close = Constants.close;
  enterUsernameLbl = Constants.enterUsernameLbl;
  enterPassLbl = Constants.enterPassLbl;
  inputItemUsername: InputItem = { iconName: 'phone', placeholderVal: this.enterUsernameLbl, val: '', type: '', label: '' };
  inputItemUsernameStr = '';
  inputItemPass: InputItem = { iconName: 'pass', placeholderVal: this.enterPassLbl, val: '', type: 'password', label: '' };
  inputItemPassStr = '';
  username = '';
  password = '';
  inputItemFullName: InputItem = { iconName: 'name', placeholderVal: this.registerNamePlaceholder, val:'', type: '', label: '' };
  inputItemFullNameStr = '';
  inputItemEmail: InputItem = { iconName: 'email', placeholderVal: this.registerEmailPlaceholder,  val: '', type: '', label: '' };
  inputItemEmailStr = '';
  alertMessage: string;
  radioItems = [
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
  changePassState = false;
  inputState = false;
  isRegister = false;
  isLogin = true;
  isForgotPass = false;
  roleItem: any;
  timeOutId:any;
  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private userService: UserService,
    private translate: TranslateService,
  ) { }
  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    this.changePassState = false;
    this.isForgotPass = false;
    clearTimeout(this.timeOutId);
    this.inputItemUsernameStr = JSON.stringify(this.inputItemUsername);
    this.inputItemPassStr = JSON.stringify(this.inputItemPass);
    this.inputItemEmailStr = JSON.stringify(this.inputItemEmail);
    this.inputItemFullNameStr = JSON.stringify(this.inputItemFullName);
    this.roleItem = this.radioItems[0];
    if (token) {
      this.authService.setUserLoginWithGoogle(JSON.parse(token));
      this.userService.getUserInfo().subscribe(next => {
        this.authService.setUserInfo(next);
        this.redirect();
      });
    }
  }


  onRegist() {
    let body = {
      name: this.inputItemFullName.val,
      phone: this.inputItemUsername.val,
      email: this.inputItemEmail.val,
      role: this.roleItem.val,
    }
    try {
      this.userService.createUser(body).subscribe(res => {
        if (res) {
          if (res.code == ConstantsApp.EXISTED) {
            this.gotoRegisterForm();
          } else {
            this.gotoLoginForm();
          }
        } else {
          this.gotoRegisterForm();
        }
        //   setInterval(() => {this.showLoading = false;}, 3);
      });
    } catch (e) {
      // console.log('onRegist -> create user: ', e);
      this.gotoRegisterForm();
      // setInterval(() => {this.showLoading = false;}, 3);
    }
  }

  onChangePass() {
    this.inputState = true;
    const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_CHANGE_PASS;
    let body = {
      phone: this.inputItemUsername.val,
      type: ConstantsApp.FORGOT_PASS
    }
    try {
      this.userService.updateUser(body, apiUrl).subscribe(res => {
        if (res) {
          // this.gotoLoginForm();
        } else {
          // this.gotoRegisterForm();
        }
        //   setInterval(() => {this.showLoading = false;}, 3);
      });
    } catch (e) {
      // console.log('onRegist -> create user: ', e);
      // this.gotoRegisterForm();
      // setInterval(() => {this.showLoading = false;}, 3);
    }
  }

  redirect() {
    this.router.navigate(['/'])
  }
  inputOnchange(val: any) {
    this.inputItemUsername.val = val
  }
  inputPassOnchange(val: any) {
    this.inputItemPass.val = val
  }

  gotoRegisterForm() {
    this.changePassState = false;
    this.inputState =false;
    this.isRegister = true;
    this.isLogin = false;
    this.isForgotPass = false;
  }
  gotoLoginForm() {
    this.changePassState= false;
    this.inputState= false;
    this.isRegister = false;
    this.isLogin = true;
    this.isForgotPass = false;

  }
  gotoForgotPassForm($event:any) {
    this.changePassState = false;
    this.isRegister = $event.isRegister;
    this.isLogin = $event.isLogin;
    this.isForgotPass = $event.isForgotPass;
  }
  changePassSuccess($event:any) {
    this.changePassState = $event.passState;

    this.timeOutId = setTimeout(() => {
      window.location.reload();
    }, 2000);

  }

  radioOnChecked(item: any) {
    this.roleItem = item;
  }

  @HostListener("click")
  clicked() {
    let some_text = "Event Triggered";
  }

  onLoginByGoogle() {
    window.location.href = environment.API_URI + ApiNameConstants.OAUTH2_AUTHORIZATION_GOOGLE;
    // window.location.href = 'http://localhost:1000/' + ApiNameConstants.OAUTH2_AUTHORIZATION_GOOGLE;
  }

  onLoginByFacebook() {
    window.location.href = environment.API_URI + ApiNameConstants.OAUTH2_AUTHORIZATION_FACEBOOK + "?redirect_uri=" + environment.URL + "app-login";
  }

  handleClick() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.location.href = 'tel: 024 6680 5588';
    } else {
      const win = window.location.href = 'tel: 024 6680 5588';
      if (win) {
        const alertMessage = this.translate.instant("acceptPopupLbl");
        alert(alertMessage);
      } 
    }
  }
 
}

