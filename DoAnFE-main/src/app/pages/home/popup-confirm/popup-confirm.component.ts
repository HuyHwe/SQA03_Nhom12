import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery';
import { Constants } from 'src/app/constant/Constants';

@Component({
  selector: 'app-popup-confirm-apply',
  templateUrl: './popup-confirm.component.html',
  styleUrls: ['./popup-confirm.component.scss']
})

export class PopupConfirmApplyComponent implements OnInit {
  @Output() validate = new EventEmitter();
  cancelLbl = Constants.cancelLbl;
  yesLbl = Constants.yesLbl;
  confirmMessage: any;
  noticeLbl = Constants.noticeLbl;
  item: any;
  isRedirect: any;
  constructor() {
    this.closePopup();
  }

  ngOnInit(): void {
    this.closePopup();
  }

  openPopup(jobItem: any, isRedirect: any) {
    this.item = jobItem;
    this.isRedirect = isRedirect;
    $('#popup-confirm-apply .modal').removeClass("hide");
    $('#popup-confirm-apply .modal').addClass("display");
  }

  closePopup() {
    this.item = null;
    this.isRedirect = false;
    $('#popup-confirm-apply .modal').removeClass("display");
    $('#popup-confirm-apply .modal').addClass("hide");
  }

  onValidate() {
    let param = {
      item: this.item,
      isRedirect: this.isRedirect
    }
    this.validate.emit(param);
    this.closePopup();
  }
}
