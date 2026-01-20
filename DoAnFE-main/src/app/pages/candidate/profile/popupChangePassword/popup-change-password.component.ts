import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import * as $ from 'jquery';
@Component({
    selector: 'app-popup-change-password',
    templateUrl: './popup-change-password.component.html',
    styleUrls: ['./popup-change-password.component.scss']
})
export class PopupChangePasswordComponent implements OnInit {
    @Output() validate = new EventEmitter();
    @Output() newPassword = new EventEmitter();
    isPopupOpen = false;

    constructor() {

    }

    ngOnInit(): void {
        this.closePopup();
    }

    openPopup() {
        this.isPopupOpen = true;
        document.body.classList.add('no-scroll');
        let modal = $(".popup-change-password .modal");
        modal.removeClass("hide");
        modal.addClass("display");
    }

    closePopup() {
        this.isPopupOpen = false;
        document.body.classList.remove('no-scroll'); 
        let modal = $(".popup-change-password .modal");
        modal.removeClass("display")
        modal.addClass("hide");
    }

    changePass(newPassword: string) {
      this.closePopup();
      this.newPassword.emit(newPassword);
    }
}
