import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { Constants } from 'src/app/constant/Constants';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})

export class ToastComponent implements OnInit, OnChanges{
  @Input() messageCode : any;
  imgLink: any;
  message: any;
  isShow: any;
  bgClass: any;
  constructor() {
  }
  ngOnInit() {
    this.isShow = false;
  }

  ngOnChanges() {
  }

  show(info: any) {
    if (info.messageCode) this.isShow = true;
    switch (info.messageCode) {
      case(ConstantsApp.SUCCESS_CODE):
        this.imgLink = '../../../../../assets/icons/white-check.svg';
        this.message = info.message? info.message: Constants.saveSuccessLbl;
        this.bgClass = 'bg-light-green';
      break;
      case(ConstantsApp.FAILED_CODE):
        this.imgLink = '../../../../../assets/icons/noti-fail.svg';
        this.message = info.message? info.message: Constants.saveFailedLbl;
        this.bgClass = 'bg-light-red';
        break;
      case(ConstantsApp.EXISTED):
        this.imgLink = '../../../../../assets/icons/noti-fail.svg';
        this.message = info.message? info.message: 'existedAccountLbl';
        this.bgClass = 'bg-light-red';
        break;
      case(ConstantsApp.WARNING_CODE):
      break;
    }

    setTimeout(() => {
      this.isShow = false;
    }, 3000);
  }
}
