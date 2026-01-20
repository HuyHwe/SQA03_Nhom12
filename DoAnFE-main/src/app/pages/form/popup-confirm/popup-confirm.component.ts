import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery';
import { Constants } from 'src/app/constant/Constants';

@Component({
    selector: 'app-popup-confirm',
    templateUrl: './popup-confirm.component.html',
    styleUrls: ['./popup-confirm.component.scss']
})
export class PopupConfirmComponent implements OnInit {
    @Output() validate = new EventEmitter();
    @Input() confirmCode: any =1;

    cancelLbl = Constants.cancelLbl;
    confirmDeleteLbl = Constants.confirmDeleteLbl;
    yesLbl = Constants.yesLbl;
    confirmMessage: any=Constants.confirmUpdateLbl;
    noticeLbl = Constants.noticeLbl;
    className: any;
    constructor() {}

    ngOnInit(): void {
        this.closePopup();
				this.openPopup()
    }

    openPopup() {
        
        switch(+this.confirmCode) {
            case 1:
                this.confirmMessage = Constants.confirmUpdateLbl;
                break;
            case 2:
                this.confirmMessage = Constants.confirmDeactiveLbl;
                break;
            case 3:
                this.confirmMessage = Constants.confirmDeleteLbl;
                break;
        }

        $('#popup-confirm .modal1').removeClass("hide");
        $('#popup-confirm .modal1').addClass("display");

    }

    closePopup() {
      $('#popup-confirm .modal1').removeClass("display");
      $('#popup-confirm .modal1').addClass("hide");
    }

    onValidate() {
        this.validate.emit();
        this.closePopup();
    }
}
