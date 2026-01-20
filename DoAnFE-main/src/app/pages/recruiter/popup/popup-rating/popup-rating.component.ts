import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery';
import { Constants } from 'src/app/constant/Constants';
import {environment} from "../../../../../environments/environment";
import {ApiNameConstants} from "../../../../constant/ApiNameConstants";
import {ConstantsApp} from "../../../../constant/ConstantsApp";
import {CommonService} from "../../../../service/common.service";

@Component({
  selector: 'app-popup-rating',
  templateUrl: './popup-rating.component.html',
  styleUrls: ['./popup-rating.component.scss']
})

export class PopupRatingComponent implements OnInit {
  @Output() validate = new EventEmitter();
  cancelLbl = Constants.cancelLbl;
  yesLbl = Constants.yesLbl;
  noticeLbl = Constants.noticeLbl;
  freelancerId: number;
  ratingStart: number;
  comment: string;
  isRedirect: any;
  constructor(private commonService: CommonService) {
    this.closePopup();
  }

  ngOnInit(): void {
    this.closePopup();
  }

  openPopup(id: number) {
    this.freelancerId = id;
    $('#popup-rating .modal').removeClass("hide");
    $('#popup-rating .modal').addClass("display");
  }

  closePopup() {
    $('#popup-rating .modal').removeClass("display");
    $('#popup-rating .modal').addClass("hide");
  }

  onRate(rate: number) {
    this.ratingStart = rate;
  }
  onValidate() {
    this.validate.emit();
    this.closePopup();
    let body = {
      freelancerId: this.freelancerId,
      ratingStar: this.ratingStart,
      comment: this.comment
    }
    let functionName = 'onValidate';
    let messageLog = 'rating candidate';
    let apiUrl = environment.API_URI + ApiNameConstants.BS_USER_RECRUITER_MANAGEMENT_SAVE;
    try {
      this.commonService.postDatas(body, apiUrl, functionName, messageLog)
        .subscribe(res => {
          if (res && res.code == ConstantsApp.EXISTED) {
            // show popup this user is existed
          } else if(res && res.code == ConstantsApp.updated) {
            this.closePopup();
          }
        });
    } catch (error) {
      console.log('onValidate: ' + error);
    }
  }
}
