import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ToastComponent } from '../../../../layout/toast/toast.component';
import { PopupConfirmApplyComponent } from '../../../home/popup-confirm/popup-confirm.component';
import { PopupJobFindingComponent } from '../../../candidate/profile/popupJobFinding/popup-job-finding.component';
import { UtilsService } from '../../../../helper/service/utils.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { CommonService } from '../../../../service/common.service';
import { ConstantsApp } from '../../../../constant/ConstantsApp';
import { PopupInfoCandidateComponent } from '../../candidate-management/table-candidate/popupInfoCandidate/popup-info-candidate.component';
import {UserService} from "../../../../service/user.service";
import {MapService} from "../../../../service/map.service";
import {ProfileCandidateService} from "../../../candidate/profile/profile.service";
import {LocalStorageService} from "../../../../core/auth/local-storage.service";
import {FileService} from "../../../../service/file-service/FileService";
import { NotificationService } from 'src/app/pages/notification/notification.service';

@Component({
  selector: 'app-candidate-items-list',
  templateUrl: './candidate-items-list.html',
  styleUrls: ['./candidate-items-list.css'],
})
export class CandidateItemsList implements OnInit, OnChanges {
  @Input() dataSource: any;
  @Input() currentPage: any;
  data: any;
  totalPage: any;
  prePage: any;
  nextPage: any;
  arrPage: any;
  isRedirect: any;
  APP_CANDIDATE_ITEMS_LIST: string = ConstantsApp.APP_CANDIDATE_ITEMS_LIST;
  @Output() changePage = new EventEmitter();
  @Output() onViewDetailItem = new EventEmitter();
  @ViewChild('popupInfoCandidate')
  popupInfoCandidate: PopupInfoCandidateComponent =
    new PopupInfoCandidateComponent(this.userService, this.mapService, this.userDetailService, this.commonService, this.localStorage, this.fileService, this.cdr, this.router, this.authService, this.utilsService, this.notificationService);
  @ViewChild('appToast') appToast: ToastComponent = new ToastComponent();
  @ViewChild('popupConfirmApply')
  popupConfirmApply: PopupConfirmApplyComponent =
    new PopupConfirmApplyComponent();
  @ViewChild('jobFinding') jobFindingPopUp: PopupJobFindingComponent =
    new PopupJobFindingComponent();

  constructor(
    private userService: UserService,
    private mapService: MapService,
    private userDetailService: ProfileCandidateService,
    private commonService: CommonService,
    private localStorage: LocalStorageService,
    private fileService: FileService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private utilsService: UtilsService,
    private notificationService: NotificationService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log("change");
    this.init();
  }
  ngOnInit() {
    this.init();
  }
  init() {
    if (
      !this.utilsService.isEmpty(this.dataSource) &&
      !this.utilsService.isEmpty(this.dataSource.data)
    ) {
      this.data =
        this.dataSource && this.dataSource.data ? this.dataSource.data : [];
        console.log(this.data);
      this.totalPage = this.dataSource.totalPage;
      this.currentPage = this.currentPage != null ? this.currentPage : 1;
      this.arrPage = [];
      for (let i = 1; i <= this.totalPage; i++) {
        this.arrPage.push(i);
      }
      console.log('candidate-items-list arrPage: ' + this.arrPage.length);
      this.setPreNextPage();
    } else {
      this.dataSource = {};
      this.data = [];
      this.arrPage = [1];
    }
  }

  isPrePageActive() {
    if (this.totalPage <= 1 || this.currentPage == 1) return false;
    return true;
  }
  isNextPageActive() {
    if (this.totalPage <= 1 || this.currentPage == this.totalPage) return false;
    return true;
  }
  onPrePageClick() {
    if (!this.isPrePageActive()) return;
    this.currentPage = this.currentPage - 1;
    this.setPreNextPage();
    this.onChangePage();
  }
  onNextPageClick() {
    if (!this.isNextPageActive()) return;
    this.currentPage = this.currentPage + 1;
    this.setPreNextPage();
    this.onChangePage();
  }
  setPreNextPage() {
    this.prePage = this.currentPage - 1;
    this.nextPage = this.currentPage + 1;
  }

  onCurrentPageClick(pageIdx: any) {
    if (this.currentPage == pageIdx) return;
    this.currentPage = pageIdx;
    this.setPreNextPage();
    this.onChangePage();
  }
  onChangePage() {
    this.changePage.emit(this.currentPage);
  }
  isDisplayPageNumber(pageNum: any) {
    if (this.currentPage <= 2) {
      return pageNum >= this.currentPage - 1 && pageNum < 6;
    }
    if (this.currentPage > this.totalPage - 2) {
      return pageNum > this.totalPage - 5 && pageNum <= this.totalPage;
    }
    if (this.currentPage > 2) {
      return pageNum >= this.currentPage - 2 && pageNum < this.currentPage + 3;
    }
    return pageNum >= this.currentPage && pageNum < this.currentPage + 5;
  }

  openPopupDetailItem(item: any) {
    this.popupInfoCandidate.openPopup(item);
    this.onViewDetailItem.emit(item);
  }

  /**
   * param {item: jobItem, isRedirect: true/false}
   */
  onValidate(param: any) {
    let jobItem = param.item;
    let isRedirect = param.isRedirect;
    if (jobItem != null) {
      this.openPopupJobFinding(jobItem);
    } else if (isRedirect) {
      //   navigate to page contain applied jobs
      this.router.navigate([ConstantsApp.LINK_JOB_LIST]);
    }
  }

  openPopupJobFinding(jobItem: any) {
    this.jobFindingPopUp.openPopup(ConstantsApp.CREATE_FREELANCER, jobItem);
  }

  showInfoSuccessfullyApply(code: any) {
    this.appToast.show({messageCode: code});
  }

  /**
   * param {item: jobItem, isRedirect: true/false}
   */
  showPopupConfirmApply(param: any) {
    let jobItem = param.item;
    let isRedirect = param.isRedirect;
    this.popupConfirmApply.openPopup(jobItem, isRedirect);
  }
}
