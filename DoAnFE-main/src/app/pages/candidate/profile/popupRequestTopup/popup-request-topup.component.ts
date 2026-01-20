import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import * as $ from 'jquery';
import {environment} from "../../../../../environments/environment";
import {ApiNameConstants} from "../../../../constant/ApiNameConstants";
import {CommonService} from "../../../../service/common.service";
import {ConstantsApp} from "../../../../constant/ConstantsApp";
import {UtilsService} from "../../../../helper/service/utils.service";

@Component({
    selector: 'app-popup-request-topup',
    templateUrl: './popup-request-topup.component.html',
    styleUrls: ['./../popupConfirmUpgradeUser/popup-confirm-upgrade-account.component.scss']
})
export class PopupRequestTopupComponent implements OnInit {
    @Output() validate = new EventEmitter();
    @Input() upgradedPackage: any
    isPopupOpen = false;

    constructor(private commonService: CommonService, private utilsService: UtilsService) {}

    ngOnInit(): void {
        this.closePopup();
    }

    openPopup() {
      this.isPopupOpen = true;
      document.body.classList.add('no-scroll');
      let modal = $(".popup-confirm-topup-account .modal");
      modal.removeClass("hide");
      modal.addClass("display");
    }

    closePopup() {
        this.isPopupOpen = false;
        document.body.classList.remove('no-scroll'); 
        let modal = $(".popup-confirm-topup-account .modal");
        modal.removeClass("display");
        modal.addClass("hide");
    }

    onValidate() {
      this.callPaymentService();
    }

  callPaymentService() {
    let user = JSON.parse(this.utilsService.getItem(ConstantsApp.user));
    let body = {
      "amount": this.upgradedPackage.price,
      "bankCode": "NCB",
      "language": "vnd",
      "phone": user.phone
    }
    const functionName = 'callPaymentService';
    const messageLog = 'call payment service';
    let apiUrl = environment.API_URI + ApiNameConstants.BS_PAYMENT_CREATE;
    try {
      this.commonService.postDatas(body, apiUrl, functionName, messageLog).subscribe(res => {
        if (res && res.data) {
          this.validate.emit();
          this.closePopup();
          window.open(res.data, '_blank')
        }
      });
    } catch(e) {
      console.log(e);
    }
  }
}
