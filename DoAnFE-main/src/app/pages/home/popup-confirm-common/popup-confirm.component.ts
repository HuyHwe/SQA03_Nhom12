import { Component, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Constants } from 'src/app/constant/Constants';

@Component({
  selector: 'app-popup-confirm-apply-common',
  templateUrl: './popup-confirm.component.html',
  styleUrls: ['./popup-confirm.component.scss']
})
export class PopupConfirmApplyComponentCommon implements OnInit, OnChanges {
  @Output() validate = new EventEmitter();
  @Output() onClose = new EventEmitter();

  cancelLbl = Constants.cancelLbl;
  yesLbl = Constants.yesLbl;
  noticeLbl = Constants.noticeLbl;

  item: any;
  isRedirect = false;
  isOpen = false; 

  constructor() {}

  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges) {}

  openPopup(jobItem: any, isRedirect: any) {
    this.item = jobItem;
    this.isRedirect = !!isRedirect;
    this.isOpen = true;
    console.log("isRedirect in openPopup: ", this.isRedirect);
  }

  closePopup() {
    this.item = null;
    this.isRedirect = false;
    this.isOpen = false; 
    this.onClose.emit();
  }

  onValidate() {
    let param = {
      item: this.item,
      isRedirect: this.isRedirect
    };
    console.log("isRedirect in onValidate: ", this.isRedirect);
    this.validate.emit(param);
    this.closePopup();
  }
}
