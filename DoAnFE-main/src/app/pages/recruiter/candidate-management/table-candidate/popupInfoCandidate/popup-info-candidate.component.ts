import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import * as $ from 'jquery';
import { PopupBookingInterviewComponent } from "../popup-booking-interview/popup-booking-interview.component";
import { UtilsService } from "../../../../../helper/service/utils.service";
import { CommonService } from "../../../../../service/common.service";
import { ToastComponent } from "../../../../../layout/toast/toast.component";
import { CandidateDetailInfoComponent } from "../../../home/candidate-detail-info/candidate-detail-info.component";
import { UserService } from "../../../../../service/user.service";
import { MapService } from "../../../../../service/map.service";
import { ProfileCandidateService } from "../../../../candidate/profile/profile.service";
import { LocalStorageService } from "../../../../../core/auth/local-storage.service";
import { FileService } from "../../../../../service/file-service/FileService";
import { Router } from "@angular/router";
import { AuthService } from "../../../../../core/auth/auth.service";
import { NotificationService } from 'src/app/pages/notification/notification.service';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { an } from '@fullcalendar/core/internal-common';
@Component({
  selector: 'app-popup-info-candidate',
  templateUrl: './popup-info-candidate.component.html',
  styleUrls: ['./popup-info-candidate.component.scss'],
})
export class PopupInfoCandidateComponent implements OnInit {
  @Input() confirmCode: any;
  @Input() parentPageCode: string;
  @Output() validate = new EventEmitter();
  @Output() popupBookingInterview: PopupBookingInterviewComponent = new PopupBookingInterviewComponent(this.utilsService, this.commonService, this.notificationService, this.localStorage);
  methodInterview = 0;
  isOpen: boolean;
  candidate: any;
  @ViewChild('appCandidateDetailInfo') appCandidateDetailInfo: CandidateDetailInfoComponent
    = new CandidateDetailInfoComponent(this.userService, this.mapService, this.userDetailService, this.commonService, this.localStorage, this.fileService, this.cdr, this.router, this.authService, this.utilsService, this.notificationService);
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
    private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.closePopup();
  }

  openPopup(item: any) {
    console.log("Item candidate: ", item);
    document.body.classList.add('no-scroll');
    this.candidate = item;

    this.isOpen = true;
    const recruiter = JSON.parse(this.utilsService.getItem('user'));

    const role = this.localStorage.getItem(ConstantsApp.role) || ConstantsApp.RECRUITER;
    const sendRole = "CANDIDATE";
    let candidateId = 0;
    console.log("Candidate status: ", this.candidate);
    if (recruiter && recruiter.id) {

      if (this.candidate.id != null) {
        candidateId = this.candidate.id
      } else candidateId = this.candidate;
      const notificationTitle = `${recruiter.name || 'Nhà tuyển dụng'} đã xem thông tin của bạn`;
      const notificationMessage = `Nhà tuyển dụng ${recruiter.name || 'không xác định'} đã xem hồ sơ của bạn vào ${new Date().toLocaleString()}.`;
      const actionUrl = `/candidate/profile/${candidateId}`;

      // Gọi API tạo thông báo
      this.notificationService.createNotification(
        candidateId, // userId: ID của ứng viên
        sendRole, // role: ứng viên
        notificationTitle,
        notificationMessage,
        'PROFILE_VIEW',
        actionUrl,
        recruiter.id
      ).subscribe({
        next: () => {
          console.log('Thông báo đã được tạo cho ứng viên:', candidateId);
        },
        error: (err) => {
          console.error('Lỗi khi tạo thông báo:', err);
        }
      });
    } else {
      console.warn('Không tìm thấy thông tin nhà tuyển dụng');
    }
    setTimeout(() => {
      // this.appCandidateDetailInfo.getData();
    }, 500);
    let modal = $('#popup-info-candidate .modal');
    modal.removeClass('hide');
    modal.addClass('display');
  }

  closePopup() {
    // document.body.classList.remove('no-scroll');
    this.isOpen = false;
    this.methodInterview = 0;
    let modal = $('#popup-info-candidate .modal');
    modal.removeClass('display');
    modal.addClass('hide');
  }

  onValidate() {
    // this.onCreateUser();
  }

  onInterview(i: number) {
    this.methodInterview = i;
    this.closePopup();
    this.popupBookingInterview.openPopup(i);
  }

  getCandidateId(): number {
    // Handle case where candidate is a number (just the ID)
    if (typeof this.candidate === 'number') {
      return this.candidate;
    }
    // Handle case where candidate is an object
    if (this.candidate && typeof this.candidate === 'object') {
      return this.candidate.freelancerId || this.candidate.id || 0;
    }
    return 0;
  }
}
