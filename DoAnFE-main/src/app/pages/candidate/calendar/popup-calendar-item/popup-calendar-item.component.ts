import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery';
import { Constants } from 'src/app/constant/Constants';
import {UtilsService} from "../../../../helper/service/utils.service";
import {environment} from "../../../../../environments/environment";
import {ApiNameConstants} from "../../../../constant/ApiNameConstants";
import {CommonService} from "../../../../service/common.service";
import {ScheduleDetail} from "../../../../model/ScheduleDetail";

@Component({
    selector: 'app-popup-calendar-item',
    templateUrl: './popup-calendar-item.component.html',
    styleUrls: ['./popup-calendar-item.component.scss']
})
export class PopupCalendarItemComponent implements OnInit {
    @Output() validate = new EventEmitter();
    @Input() confirmCode: any;
    cancelLbl = Constants.cancelLbl;
    yesLbl = Constants.yesLbl;
    confirmMessage: any;
    noticeLbl = Constants.noticeLbl;
    itemPram: any;
    item: ScheduleDetail;
    constructor(
      private utilsService: UtilsService,
      private commonService: CommonService
    ) {
      this.closePopup();
      this.item = new ScheduleDetail();
    }

    ngOnInit(): void {
        this.closePopup();
    }

    openPopup(item: any) {
      this.itemPram = item;
      this.getData();
      $('#popup-calendar-item .modal').removeClass("hide");
      $('#popup-calendar-item .modal').addClass("display");

    }

    closePopup() {
      $('#popup-calendar-item .modal').removeClass("display");
      $('#popup-calendar-item .modal').addClass("hide");
    }

    onValidate() {
        this.validate.emit();
        this.closePopup();
    }

    getData() {
      const functionName = 'getData';
      const messageLog = 'get detail a schedule';
      console.log('itemPram ID:', this.itemPram);
      const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_FIND_SCHEDULE_BY_ID + "?id=" + this.itemPram.id;
      this.commonService
        .getData(apiUrl, functionName, messageLog)
        .subscribe(
          (res: any) => {
            if (res && res.data) {
              this.item = res.data;
            }
          },
          (error) => {
            console.error('API error:', error);
          }
        );
    }
    getAddress() {
      if (this.itemPram) {
        return this.utilsService.getAddress(this.itemPram.province, this.itemPram.ward)
      }
      return null;
    }
    adjustTime(dateString: any, hoursToSubtract: number): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  date.setHours(date.getHours() - hoursToSubtract);
  return date;
}
}
