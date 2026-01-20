import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import * as $ from 'jquery';

@Component({
    selector: 'app-popup-confirm-upgrade-account',
    templateUrl: './popup-confirm-upgrade-account.component.html',
    styleUrls: ['./popup-confirm-upgrade-account.component.scss']
})
export class PopupConfirmUpgradeAccount implements OnInit {
    @Output() validate = new EventEmitter();
    isPopupOpen = false;

    constructor() {}

    ngOnInit(): void {
        this.closePopup();
    }

    openPopup() {
      this.isPopupOpen = true;
      document.body.classList.add('no-scroll');
      let modal = $(".popup-confirm-upgrade-account .modal");
      modal.removeClass("hide");
      modal.addClass("display");
    }

    closePopup() {
        this.isPopupOpen = false;
        document.body.classList.remove('no-scroll'); 
        let modal = $(".popup-confirm-upgrade-account .modal");
        modal.removeClass("display");
        modal.addClass("hide");
    }

    onValidate() {
      this.validate.emit();
      this.closePopup();
    }

}
