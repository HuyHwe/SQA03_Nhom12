import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import * as $ from 'jquery';
import {environment} from "../../../../../environments/environment";
import {ApiNameConstants} from "../../../../constant/ApiNameConstants";
import {ConstantsApp} from "../../../../constant/ConstantsApp";
import {CommonService} from "../../../../service/common.service";
import {UtilsService} from "../../../../helper/service/utils.service";

@Component({
    selector: 'app-popup-upgrade-account',
    templateUrl: './popup-upgrade-account.component.html',
    styleUrls: ['./popup-upgrade-account.component.scss']
})
export class PopupUpgradeAccount implements OnInit {
    @Output() validate = new EventEmitter();
    @Output() upgradeAcc = new EventEmitter();
    packages: any;
		selectedPackage:any
    isPopupOpen = false;

    constructor(private commonService: CommonService, private utilsService: UtilsService) {
    }

    ngOnInit(): void {
        this.closePopup();
    }

    openPopup() {
        this.isPopupOpen = true;
        document.body.classList.add('no-scroll');
        let modal = $(".popup-upgrade-account .modal");
        modal.removeClass("hide");
        modal.addClass("display");
        this.getData();
    }
		onSelect(selected: any){
			this.selectedPackage = selected
		}
    closePopup() {
        this.isPopupOpen = false;
        document.body.classList.remove('no-scroll'); 
        let modal = $(".popup-upgrade-account .modal");
        modal.removeClass("display")
        modal.addClass("hide");
    }

    onValidate() {
      this.closePopup();
      this.validate.emit(this.selectedPackage);
    }

    getData() {
      this.packages = [];
      const functionName = 'getData';
      const messageLog = 'get package data';
      let apiUrl = environment.API_URI + ApiNameConstants.BS_CONFIGURATION_PACKAGE_SEARCH;
      this.commonService.getData(apiUrl, functionName, messageLog).subscribe((res) => {
        if (res && res.data) {
          this.packages = res.data;
          this.packages.sort((a: any, b: any) => this.utilsService.sortASC(a, b, ConstantsApp.type));
        }
      });
    }
}
