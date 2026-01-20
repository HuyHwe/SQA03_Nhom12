import { Component, OnInit, Output, ViewChild, Input, EventEmitter, OnChanges } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { CommonService } from 'src/app/service/common.service';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { MapService } from 'src/app/service/map.service';
import { ConstantsApp } from "../../../../constant/ConstantsApp";
import { Router } from "@angular/router";
import { PopupConfirmApplyComponent } from "../../../home/popup-confirm/popup-confirm.component";
import { PopupJobFindingComponent } from "../../profile/popupJobFinding/popup-job-finding.component";
import { NotificationService } from 'src/app/pages/notification/notification.service';
import { cA } from '@fullcalendar/core/internal-common';
@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss'],
})
export class JobDetailComponent implements OnInit, OnChanges {
  @Input() itemParam: any;
  @Input() userId: any;
  @Output() onBack = new EventEmitter();
  @Output() onSaveJob = new EventEmitter();
  @Output() onApply = new EventEmitter();
  @Input() isDisplayBackBtn: any;
  @Output() openPopupConfirm = new EventEmitter();
  @Output() applyInform = new EventEmitter();
  @ViewChild('popupConfirmApply', { static: false }) popupConfirmApply!: PopupConfirmApplyComponent;

  @ViewChild('jobFinding') jobFindingPopUp: PopupJobFindingComponent =
    new PopupJobFindingComponent();
  localUserId: any;
  dataSource: any;
  jobId: any;
  item: any;
  SAVED_JOB_STATUS: any;
  isShowJobInfo: any;
  isShowCompanyInfo: any;
  isShowJobFinding: boolean = false;
  isShowPopupConfirm: boolean = false;
  constructor(
    private utilsService: UtilsService,
    private commonService: CommonService,
    private router: Router,
    private mapService: MapService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.isShowJobInfo = true;
    setTimeout(() => {
      this.isShowJobFinding = false;
      this.isShowPopupConfirm = false;
    }, 0);
    this.item = this.itemParam;
    this.SAVED_JOB_STATUS = ConstantsApp.saved;
  }
  ngOnChanges(): void {
    console.log('Item param in job detail: ', this.itemParam);
    this.item = this.itemParam ? this.itemParam : this.item;
    if (this.userId !== this.itemParam?.userId && this.userId !== undefined) {
      console.warn('userId mismatch detected!', {
        inputUserId: this.userId,
        itemUserId: this.itemParam?.userId
      });
      this.localUserId = this.userId;
    }
  }
  isSavedJobPage() {
    return this.router.url && (this.router.url).includes(ConstantsApp.LINK_SAVED_JOBS);
  }
  isAppliedJobPage() {
    return this.router.url && (this.router.url).includes(ConstantsApp.LINK_JOB_LIST);
  }
  init(body: any) {
    this.getData();
  }
  back() {
    this.onBack.emit();
  }
  getData() {
    const functionName = 'getData';
    const messageLog = 'get list jobs';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_JOB_SEARCH;
    this.commonService
      .postDatas(null, apiUrl, functionName, messageLog)
      .subscribe(
        (res: any) => {
          if (res && res.data) {
            this.dataSource = res;
          } else {
            this.dataSource = null;
          }
        },
        (error) => {
          this.dataSource = null;
          console.error('API error:', error);
        }
      );
  }

  saveJob() {
    const candidate = JSON.parse(this.utilsService.getItem('user'));

    const sendRole = "RECRUITER";
    const postId = this.item.id; // ID của bài đăng
    const postName = this.item.name; // Tên của bài đăng
    const recruiterId = this.localUserId; // ID của nhà tuyển dụng
    console.log("Candidate: ", candidate)
    console.log("Post ID: ", postId)
    console.log("Recruiter ID: ", recruiterId)
    if (candidate && candidate.id) {
      const candidateId = candidate.id;
      const notificationTitle = `${candidate.name || 'Người tìm việc'} đã lưu bài đăng của bạn`;
      const notificationMessage = `Người tìm việc ${candidate.name || 'không xác định'} đã lưu bài đăng ${postId}:${postName} của bạn vào ${new Date().toLocaleString()}.`;
      const actionUrl = `/recuiter/post/${postId}`;

      // Gọi API tạo thông báo
      this.notificationService.createNotification(
        recruiterId, // userId: ID của ứng viên
        sendRole, // role: ứng viên
        notificationTitle,
        notificationMessage,
        'JOB_SAVE',
        actionUrl,
        candidateId
      ).subscribe({
        next: () => {
          console.log('Thông báo đã được tạo cho nhà tuyển dụng:', recruiterId);
        },
        error: (err) => {
          console.error('Lỗi khi tạo thông báo:', err);
        }
      });
    } else {
      console.warn('Không tìm thấy thông tin ứng viên');
    }
    this.onSaveJob.emit();
  }

  onChangeTab(isShowJobInfo: any, isShowCompanyInfo: any) {
    this.isShowJobInfo = isShowJobInfo;
    this.isShowCompanyInfo = isShowCompanyInfo;
  }

  onCheckProfileIsExisted() {
    console.log('onCheckProfileIsExisted');
    const functionName = 'onCheckProfileIsExisted';
    const messageLog = 'check is existed profile for this job';
    let apiUrl = environment.API_URI + ApiNameConstants.BS_USER_FIND_FREELANCER_BY_USER_AND_JOB_DEFAULT + '?jobDefaultId=' + this.item.jobDefaultId;
    this.commonService
      .postDatas(null, apiUrl, functionName, messageLog)
      .subscribe(
        (res: any) => {
          console.log('onCheckProfileIsExisted: ', res);
          if (res && res.data && res.data.length > 0) {
            let freelancer = res.data[0];
            this.apply(freelancer.id);
            console.log("This item: ", this.item);
            console.log("Item param: ", this.itemParam);

          } else {
            console.log('Hiện thông báo chưa có.');
            this.onOpenPopupConfirm();
          }
          const candidate = JSON.parse(this.utilsService.getItem('user'));
          const sendRole = "RECRUITER";
          const postId = this.item.id; // ID của bài đăng
          const postName = this.item.name; // Tên của bài đăng
          const recruiterId = this.localUserId; // ID của nhà tuyển dụng
          console.log("Candidate: ", candidate)
          console.log("Post ID: ", postId)
          console.log("Recruiter ID: ", recruiterId)
          if (candidate && candidate.id) {
            const candidateId = candidate.id;
            const notificationTitle = `${candidate.name || 'Người tìm việc'} đã ứng tuyển bài đăng của bạn`;
            const notificationMessage = `Người tìm việc ${candidate.name || 'không xác định'} đã ứng tuyển bài đăng ${postId}:${postName} của bạn vào ${new Date().toLocaleString()}.`;
            const actionUrl = `/recuiter/post/${postId}`;

            // Gọi API tạo thông báo
            this.notificationService.createNotification(
              recruiterId, // userId: ID của ứng viên
              sendRole, // role: ứng viên
              notificationTitle,
              notificationMessage,
              'JOB_APPLY',
              actionUrl,
              candidateId
            ).subscribe({
              next: () => {
                console.log('Thông báo đã được tạo cho nhà tuyển dụng:', recruiterId);
              },
              error: (err) => {
                console.error('Lỗi khi tạo thông báo:', err);
              }
            });
          } else {
            console.warn('Không tìm thấy thông tin ứng viên');
          }
        },
        (error) => {
          console.error('API error:', error);
        }
      );

  }

  apply(freelancerId: any) {
    let body = {
      freelancerId: freelancerId,
      jobId: this.item.id,
      status: 1
    };
    const functionName = 'onApply';
    const messageLog = 'apply this job';
    let apiUrl = environment.API_URI + ApiNameConstants.BS_USER_SCHEDULE_SAVE;
    this.commonService
      .postDatas(body, apiUrl, functionName, messageLog)
      .subscribe(
        (res: any) => {
          if (res && res.status == ConstantsApp.CREATED) {
            this.applyInform.emit(ConstantsApp.SUCCESS_CODE);
            this.onOpenPopupConfirmRedirectToOtherPage();
          }
        },
        (error) => {
          console.error('API error:', error);
        }
      );
  }

  onOpenPopupConfirm() {
    let param = {
      item: this.item,
      isRedirect: false
    }
    this.showPopupConfirmApply(param);
  }

  onOpenPopupConfirmRedirectToOtherPage() {
    let param = {
      item: null,
      isRedirect: true
    }
    this.showPopupConfirmApply(param);
  }

  showPopupConfirmApply(param: any) {
  this.isShowPopupConfirm = true;
  let jobItem = param.item;
  let isRedirect = param.isRedirect;
  console.log("isRedirect: ", isRedirect);
  // setTimeout(() => {
    console.log('Inside setTimeout, calling openPopup, popupConfirmApply:', this.popupConfirmApply);
    if (this.popupConfirmApply) {
      this.popupConfirmApply.openPopup(jobItem, isRedirect);
    } else {
      console.error('popupConfirmApply is undefined');
    }
  // }, 0);
}

  /**
   * param {item: jobItem, isRedirect: true/false}
   */
  onValidate(param: any) {
    let jobItem = param.item;
    let isRedirect = param.isRedirect;
    if (jobItem != null) {
      this.isShowJobFinding = true;
      console.log('onValidate isShowJobFinding: ' + this.isShowJobFinding);
      setTimeout(() => {
        this.openPopupJobFinding(jobItem);
      }, 100);
    } else if (isRedirect) {
      this.router.navigate([ConstantsApp.LINK_JOB_LIST]).then(() => {
        window.scrollTo(0, 0); 
      });
    }
  }

  openPopupJobFinding(jobItem: any) {
    console.log("job-detail",jobItem)
    this.jobFindingPopUp.openPopup(ConstantsApp.CREATE_FREELANCER, jobItem);
  }

  onClosePopupJobFinding() {
    this.isShowJobFinding = false;
    console.log('onClosePopupJobFinding: ' + this.onClosePopupJobFinding)
  }

  onClosePopupConfirm() {
    this.isShowPopupConfirm = false;
    console.log('onClosePopupConfirm: ' + this.isShowPopupConfirm)
  }
}
