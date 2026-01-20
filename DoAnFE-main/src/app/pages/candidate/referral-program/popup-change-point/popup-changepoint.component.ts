import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery';
import { Constants } from 'src/app/constant/Constants';
import { CommonService } from 'src/app/service/common.service';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { environment } from 'src/environments/environment';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';

@Component({
  selector: 'app-popup-changepoint',
  templateUrl: './popup-changepoint.component.html',
  styleUrls: ['./popup-changepoint.component.scss'],
})
export class PopupChangePointComponent implements OnInit {
  @Output() validate = new EventEmitter();
  @Input() confirmCode: any;
  changeTypes: any[] = [
    { code: 'REWARD', name: 'Đổi phần thưởng' },
    { code: 'POINT', name: 'Đổi điểm thưởng' }
  ];
  selectedChangeType: any;
  moneyAmount: number = 0;
  pointAmount: number = 0;
  moneyDisplay: string = '';
  pointDisplay: string = '0';
  // 1,000 VND = 100 points -> 1 VND = 0.1 point
  private readonly pointPerVnd = 0.1;

  constructor(private commonService: CommonService) {}

  ngOnInit(): void {
    this.closePopup();
    // default to "Đổi điểm thưởng"
    this.selectedChangeType = this.changeTypes.find(t => t.code === 'POINT');
  }

  onMoneyInput(event: any) {
    const raw: string = (event?.target?.value || '').toString();
    const numericOnly = raw.replace(/\D/g, '');
    this.moneyAmount = Number(numericOnly || 0);
    this.moneyDisplay = this.formatWithDots(numericOnly);
    // round down to whole points
    this.pointAmount = Math.floor(this.moneyAmount * this.pointPerVnd);
    this.pointDisplay = this.formatWithDots(String(this.pointAmount));
  }

  private formatWithDots(value: string): string {
    if (!value) return '';
    // remove leading zeros to avoid big strings like 0001
    const trimmed = value.replace(/^0+(?!$)/, '');
    return trimmed.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  onRedeem() {
    if (!this.moneyAmount || this.moneyAmount <= 0) {
      return;
    }
    const apiUrl = environment.API_URI + ApiNameConstants.BS_PAYMENT_WALLET_REDEEM_POINT + `?moneyAmount=${this.moneyAmount}`;
    const functionName = 'redeemPoint';
    const messageLog = 'redeem wallet points';
    this.commonService.postDatas(null, apiUrl, functionName, messageLog).subscribe((res: any) => {
      if ((res && (res.code === ConstantsApp.SUCCESS_CODE || res.code === '200')) || (res && res.status === 'SUCCESS')) {
        this.validate.emit(ConstantsApp.SUCCESS_CODE);
      } else {
        this.validate.emit(ConstantsApp.NOT_MODIFIED_CODE);
      }
      this.closePopup();
    }, _err => {
      this.validate.emit(ConstantsApp.NOT_MODIFIED_CODE);
      this.closePopup();
    });
  }

  openPopup() {
    document.body.classList.add('no-scroll');
    $('#popup-change-point .modal').removeClass('hide');
    $('#popup-change-point .modal').addClass('display');
  }

  closePopup() {
    document.body.classList.remove('no-scroll');
    $('#popup-change-point .modal').removeClass('display');
    $('#popup-change-point .modal').addClass('hide');
  }

  onValidate() {
    this.validate.emit();
    this.closePopup();
  }
}
