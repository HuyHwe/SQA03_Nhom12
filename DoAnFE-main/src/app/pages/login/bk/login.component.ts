import { Component, Inject, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { InputItem } from 'src/app/model/inputItem';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Router } from '@angular/router';
import { Constants } from 'src/app/constant/Constants';
import { UtilsService } from 'src/app/helper/service/utils.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
    forgotPassLbl = 'Quên mật khẩu?';
    loginLbl = 'Đăng nhập';
    otherLoginOptionLbl = 'Hoặc đăng nhập bằng';
    registerLbl = 'Đăng ký';
    isHasAccountQuestion = 'Bạn chưa có tài khoản? ';
    close = 'Đóng';
    usernameLbl = 'Số điện thoại/ Email';
    passLbl = 'Mật khẩu';
    enterUsernameLbl = 'Nhập số điện thoại/ Email';
    enterPassLbl = 'Nhập mật khẩu';
    inputItemUsername: InputItem = {iconName: 'phone', placeholderVal: this.enterUsernameLbl, val: '', type: '', label: ''};
    inputItemUsernameStr = '';
    inputItemPass: InputItem = {iconName: 'pass', placeholderVal: this.enterPassLbl, val: '', type: 'password', label: ''};
    inputItemPassStr = '';
    username = '';
    password = '';
    constructor(
        private router: Router,
        private authService: AuthService

    ) {}
    ngOnInit(): void {
        // todo comment
        // this.closePopup();
        this.opentPopup();
        this.inputItemUsernameStr = JSON.stringify(this.inputItemUsername);
        this.inputItemPassStr = JSON.stringify(this.inputItemPass);
    }

    opentPopup() {
        let modal = $(".modal");
        modal.removeClass("hide");
        modal.addClass("display");
    }

    closePopup() {
        let modal = $(".modal");
        modal.removeClass("display")
        modal.addClass("hide");
    }

    onLogin() {
        let credentials = {
            username: this.inputItemUsername.val,
            password: window.btoa(this.inputItemPass.val)
        }
        this.authService.signIn(credentials) .subscribe(res => {
            // this.inputItemUsernameStr = JSON.stringify(this.inputItemUsername);
            this.closePopup();
            this.redirect();
        })
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
}   