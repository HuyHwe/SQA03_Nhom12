import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery';
import { Constants } from 'src/app/constant/Constants';
import {ConstantsApp} from "../../../constant/ConstantsApp";

@Component({
    selector: 'app-popup-confirm',
    templateUrl: './popup-confirm.component.html',
    styleUrls: ['./popup-confirm.component.scss']
})
export class PopupConfirmComponent implements OnInit {
    @Output() validate = new EventEmitter();
    @Input() confirmCode: any;

    cancelLbl = Constants.cancelLbl;
    confirmDeleteLbl = Constants.confirmDeleteLbl;
    yesLbl = Constants.yesLbl;
    confirmMessage: any;
    noticeLbl = Constants.noticeLbl;

    constructor() {
      this.closePopup();
    }

    ngOnInit(): void {
        this.closePopup();
				// this.openPopup()
    }

    openPopup() {
        switch(this.confirmCode) {
            case 1:
                this.confirmMessage = Constants.confirmUpdateLbl;
                $('#popup-confirm .modal').removeClass("hide");
                $('#popup-confirm .modal').addClass("display");
                break;
            case 2:
                this.confirmMessage = Constants.confirmDeactiveLbl;
                $('#popup-confirm .modal').removeClass("hide");
                $('#popup-confirm .modal').addClass("display");
                break;
            case 3:
                this.confirmMessage = Constants.confirmDeleteLbl;
                $('#popup-confirm .modal').removeClass("hide");
                $('#popup-confirm .modal').addClass("display");
                break;
            case ConstantsApp.CONFIRM_CREATING_NEW_POST:
                this.confirmMessage = Constants.informCreatingPostLbl;
                $('#popup-confirm .modal').removeClass("hide");
                $('#popup-confirm .modal').addClass("display");
                break;
        }
    }

    closePopup() {
      $('#popup-confirm .modal').removeClass("display");
      $('#popup-confirm .modal').addClass("hide");
    }

    onValidate() {
        this.validate.emit();
        this.closePopup();
    }
}
