import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import * as $ from 'jquery';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from "../../../../../constant/ConstantsApp";
import { Schedule } from "../../../../../model/Schedule";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { UtilsService } from "../../../../../helper/service/utils.service";
import { environment } from "../../../../../../environments/environment";
import { ApiNameConstants } from "../../../../../constant/ApiNameConstants";
import { CommonService } from "../../../../../service/common.service";
import { NotificationService } from 'src/app/pages/notification/notification.service';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';
@Component({
  selector: 'app-popup-booking-interview',
  templateUrl: './popup-booking-interview.component.html',
  styleUrls: ['./../popupInfoCandidate/popup-info-candidate.component.scss']
})

export class PopupBookingInterviewComponent implements OnInit {
  @Output() validate = new EventEmitter();
  @Input() candidate: any;

  cancelLbl = Constants.cancelLbl;
  yesLbl = Constants.yesLbl;
  noticeLbl = Constants.noticeLbl;
  freelancerId: number;
  ratingStart: number;
  comment: string;
  isRedirect: any;
  methodInterview: number;
  radioItem: any;
  scheduleForm: any;
  schedule: Schedule;
  isEditMode: boolean;

  meetingId: string;
  passcode: string;
  linkzoom: string;
  radioItems = [
    {
      label: Constants.onlineLbl,
      val: ConstantsApp.ONLINE,
      checked: true
    },
    {
      label: Constants.offLineLbl,
      val: ConstantsApp.OFFLINE,
      checked: false
    }
  ]
  constructor(
    private utilsService: UtilsService,
    private commonService: CommonService,
  private notificationService: NotificationService,
  private localStorage: LocalStorageService,
  ) {
    this.methodInterview = 1;
    this.closePopup();
    this.schedule = new Schedule();
    this.radioItem = this.radioItems[0];
    this.schedule.type = this.radioItem.val;
  }

  ngOnInit(): void {
    this.closePopup();
    this.scheduleForm = new FormGroup({
      topic: new FormControl('', [Validators.required]),
      des: new FormControl('', [Validators.required]),
      interviewDate: new FormControl('', [Validators.required]),
      interviewStartTime: new FormControl('', [Validators.required]),
      interviewEndTime: new FormControl('', [Validators.required]),
      address: new FormControl(''),
      meetingId: new FormControl('', [Validators.required]),
      passcode: new FormControl('', [Validators.required]),
      linkzoom: new FormControl('', [Validators.required]),
    });
    this.scheduleForm.enable();
  }

  openPopup(methodInterview: number) {
    document.body.classList.add('no-scroll');
    $('#popup-booking .modal').removeClass("hide");
    $('#popup-booking .modal').addClass("display");
  }

  closePopup() {
    document.body.classList.remove('no-scroll');
    $('#popup-booking .modal').removeClass("display");
    $('#popup-booking .modal').addClass("hide");
  }

  onRate(rate: number) {
    this.ratingStart = rate;
  }
  onInterview(methodInterview: number) {
    console.log(this.scheduleForm)
    console.log(this.scheduleForm.valid);

    if (methodInterview == 2 && this.scheduleForm.valid) {
      this.createScheduleInterview();
    }
    const recruiter = JSON.parse(this.utilsService.getItem('user'));

    const role = this.localStorage.getItem(ConstantsApp.role) || ConstantsApp.RECRUITER;
    const sendRole = "CANDIDATE";
    console.log("Cađiate: ", this.candidate);
    if (recruiter && recruiter.id) {
      const candidateId = this.candidate.freelancerId || this.candidate.id;
      const notificationTitle = `${recruiter.name || 'Nhà tuyển dụng'} đã xem tạo lịch phỏng vấn bạn`;
      const notificationMessage = `Nhà tuyển dụng ${recruiter.name || 'không xác định'} đã tạo lịch phỏng vấn với bạn từ ${this.schedule.interviewStartTime} đến ${this.schedule.interviewEndTime} ngày ${this.schedule.interviewDate}.`;
      const actionUrl = `/candidate/interview/${candidateId}`;

      // Gọi API tạo thông báo
      this.notificationService.createNotification(
        candidateId, // userId: ID của ứng viên
        sendRole, // role: ứng viên
        notificationTitle,
        notificationMessage,
        'INTERVIEW',
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
  }

  createScheduleInterview() {
    // Map interviewMethod: true if ONLINE, false if OFFLINE
    const interviewMethod = this.schedule.type === ConstantsApp.ONLINE;
    
    let body = {
      scheduleId: this.candidate.scheduleId,
      freelancerId: this.candidate.id,
      jobId: this.candidate.jobId,
      type: this.schedule.type,
      topic: this.schedule.topic,
      des: this.schedule.des,
      address: this.schedule.address,
      startDate: new Date(this.schedule.interviewDate + 'T' + this.schedule.interviewStartTime + ':00').toISOString(),
      endDate: new Date(this.schedule.interviewDate + 'T' + this.schedule.interviewEndTime + ':00').toISOString(),
      status: String(ConstantsApp.INTERVIEW_PROCESSING),
      interviewResult: null,
      feedback: null,
      interviewMethod: interviewMethod,
      meetingId: this.schedule.meetingId || null,
      meetUrl: this.schedule.linkzoom || null,
      passcode: this.schedule.passcode || null
    };
    const functionName = 'createScheduleInterview';
    const messageLog = 'create schedule to interview';
    let apiUrl = environment.API_URI + ApiNameConstants.BS_USER_SCHEDULE_SAVE;
    this.commonService
      .postDatas(body, apiUrl, functionName, messageLog)
      .subscribe(
        (res: any) => {
          console.log('createScheduleInterview: ', res);
          if (res && res.status == ConstantsApp.CREATED) {
            this.closePopup();
            this.scheduleForm.disable();
          }
        },
        (error) => {
          console.error('API error:', error);
        }
      );
  }
  onValidate() {

  }
  radioOnChecked(item: any) {
    this.radioItem = item;
    this.schedule.type = this.radioItem.val;

    if (this.isChoseOnline()) {
      this.scheduleForm.get('address').clearValidators();
      this.scheduleForm.get('meetingId').setValidators([Validators.required]);
      this.scheduleForm.get('passcode').setValidators([Validators.required]);
      this.scheduleForm.get('linkzoom').setValidators([Validators.required]);
    } else {
      this.scheduleForm.get('address').setValidators([Validators.required]);
      this.scheduleForm.get('meetingId').clearValidators();
      this.scheduleForm.get('passcode').clearValidators();
      this.scheduleForm.get('linkzoom').clearValidators();
    }

    this.scheduleForm.get('address').updateValueAndValidity();
    this.scheduleForm.get('meetingId').updateValueAndValidity();
    this.scheduleForm.get('passcode').updateValueAndValidity();
    this.scheduleForm.get('linkzoom').updateValueAndValidity();
  }
  isChoseOnline() {
    return this.radioItem.val == ConstantsApp.ONLINE;
  }
  checkDisableForm() {
    if (!this.isEditMode) {
      this.scheduleForm.disable();
    } else {
      this.scheduleForm.enable();
    }
  }
}
