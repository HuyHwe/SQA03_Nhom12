import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery';
import { Constants } from 'src/app/constant/Constants';
import {CommonService} from "../../../../service/common.service";

@Component({
  selector: 'app-popup-creating-post',
  templateUrl: './popup-creating-post.component.html',
  styleUrls: ['./popup-creating-post.component.scss']
})

export class PopupCreatingPostComponent implements OnInit {
  @Output() validate = new EventEmitter();
  @Input() freelancerId: number;
  @Input() jobDefaultId: number;
  cancelLbl = Constants.cancelLbl;
  yesLbl = Constants.yesLbl;
  noticeLbl = Constants.noticeLbl;
  ratingStart: number;
  comment: string;
  isRedirect: any;
  constructor(private commonService: CommonService) {
    this.closePopup();
  }

  ngOnInit(): void {
    this.closePopup();
  }

  openPopup() {
    $('#popup-creating-post .modal').removeClass("hide");
    $('#popup-creating-post .modal').addClass("display");
  }

  closePopup() {
    $('#popup-creating-post .modal').removeClass("display");
    $('#popup-creating-post .modal').addClass("hide");
  }

  onRate(rate: number) {
    this.ratingStart = rate;
  }

  onValidate() {

  }
  afterCreateJobDone() {
    this.closePopup();
  }
}
