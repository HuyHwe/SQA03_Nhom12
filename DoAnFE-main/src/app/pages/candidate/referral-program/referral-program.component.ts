import {
  Component,
  ViewChild,
  OnInit,
  Output,
  EventEmitter, ChangeDetectorRef,
} from '@angular/core';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { PopupChangePointComponent } from './popup-change-point/popup-changepoint.component';
import { PopupReferralComponent } from './popup-refferral/popup-referral.component';
import {ReferralProgramService} from "./referral-program.service";
import {UtilsService} from "../../../helper/service/utils.service";
import {CommonService} from "../../../service/common.service";
import {ToastComponent} from "../../../layout/toast/toast.component";
import {ApiModel} from "../../../model/ApiModel";
import {environment} from "../../../../environments/environment";
import {ApiNameConstants} from "../../../constant/ApiNameConstants";

@Component({
  selector: 'app-referral-program-candidate',
  templateUrl: './referral-program.component.html',
  styleUrls: ['./referral-program.component.scss'],
})
export class ReferralProgramCandidateComponent implements OnInit {
  @ViewChild('appToast') appToast: ToastComponent = new ToastComponent();
  @ViewChild('popupChangePoint') popupChangePoint!: PopupChangePointComponent;
  @ViewChild('popupReferral') popupReferral: PopupReferralComponent =
    new PopupReferralComponent(this.commonService, this.utilsService);
  @Output() activeLink: EventEmitter<boolean> = new EventEmitter<boolean>();
  displayedColumns: any = [];
  dataIntroUsersOrg: any = [];
  displayedColumnsIntro: any = [];
  bonusPoint: number = 0;
  apiModels: ApiModel[];
  pageNum: number = 1;
 
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private utilsService: UtilsService,
    private commonService: CommonService,
    private referralProgramService: ReferralProgramService) {
    // this.init();
  }

  ngOnChanges(): void {
    // this.init();
  }
  ngOnInit(): void {
    this.init();
  }

  onActiveLink(item: any, event: any, idx: any) {
    this.activeLink.emit(item);
    console.log(this.activeLink.emit(item));
  }
  init() {
    this.displayedColumnsIntro = [
      {
        name: Constants.nameLbl,
        key: ConstantsApp.name_,
        isAsc: true,
      },
      {
        name: Constants.phoneNumberLbl,
        key: ConstantsApp.phone,
        isAsc: false,
      },
      {
        name: Constants.emailLbl,
        key: ConstantsApp.email,
        isAsc: false,
      },
      {
        name: Constants.dateOfBirthLbl,
        key: ConstantsApp.dateOfBirth,
        isAsc: false,
      },
      {
        name: Constants.genderLBL,
        key: ConstantsApp.gender,
        isAsc: false,
      },
      {
        name: Constants.addressLbl,
        key: ConstantsApp.address,
        isAsc: false,
      }
    ];
    this.getData();
  }

  openPopupChangePoint() {
    this.popupChangePoint.openPopup();
  }

  openPopupReferral() {
    this.popupReferral.openPopup();
  }

  getData() {
    let bodyGetIntroUsers = this.utilsService.getItem(ConstantsApp.user);
    let phone = bodyGetIntroUsers.phone;
    let bodyIntro = {
      page : this.pageNum,
      size : ConstantsApp.PAGE_SIZE,
    }
    this.bonusPoint = bodyGetIntroUsers.bonusPoint? bodyGetIntroUsers.bonusPoint : 0;
    this.apiModels = [
      new ApiModel('get introduced users', environment.API_URI + ApiNameConstants.BS_USER_INTRODUCED_USERS, bodyIntro, ConstantsApp.POST),
      // new ApiModel('get wallet info', environment.API_URI + ApiNameConstants.BS_PAYMENT_WALLET_BY_USER + "?phone=" + phone, null, ConstantsApp.GET),
      new ApiModel('get wallet info', environment.API_URI + ApiNameConstants.BS_PAYMENT_WALLET_BY_USER, null, ConstantsApp.GET),
    ];
    this.commonService
      .retrieveData(this.apiModels)
      .subscribe(res => {
          if (res && res[0] && res[0].data && !this.utilsService.isEmpty(res[0].data)) {
            this.dataIntroUsersOrg = res[0];
          }
          if (res && res[1] && res[1].data && !this.utilsService.isEmpty(res[1].data)) {
            let wallet = res[1].data;
            this.bonusPoint = wallet.totalPoint;
          }
        },
        (error) => {
          console.error('API error:', error);
        });
  }

  onCreateUser(messageCode: any) {
    if (messageCode == ConstantsApp.SUCCESS_CODE) {
      this.getData();
    } else if (messageCode == ConstantsApp.NOT_MODIFIED_CODE || messageCode == ConstantsApp.EXISTED) {
      this.appToast.show({messageCode: messageCode});
    }
  }

  // handle redeem success from popup
  onRedeemFinished = (messageCode: any) => {
    if (messageCode === ConstantsApp.SUCCESS_CODE) {
      this.appToast.show({messageCode: ConstantsApp.SUCCESS_CODE});
      // refresh wallet/points
      this.getData();
      // optional full reload if desired
      // location.reload();
    } else {
      this.appToast.show({messageCode: ConstantsApp.NOT_MODIFIED_CODE});
    }
  }


  changePage(currentPage: any) {
    this.pageNum = currentPage;
    this.getData();
  }
 
}
