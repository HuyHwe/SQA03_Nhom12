import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import * as $ from 'jquery';
@Component({
    selector: 'app-popup-add-user',
    templateUrl: './popup-add-user.component.html',
    styleUrls: ['./popup-add-user.component.scss']
})
export class PopupAddUserComponent implements OnInit {
    @Output() validate = new EventEmitter();
    constructor() {

    }

    ngOnInit(): void {
        // this.closePopup();
    }

    openPopup() {
        let modal = $(".popup-add-user-wrapper .modal");
        modal.removeClass("hide");
        modal.addClass("display");
    }

    closePopup() {
        let modal = $(".popup-add-user-wrapper .modal");
        modal.removeClass("display")
        modal.addClass("hide");
    }

    onValidate() {
        // this.onCreateUser();
    }

}
