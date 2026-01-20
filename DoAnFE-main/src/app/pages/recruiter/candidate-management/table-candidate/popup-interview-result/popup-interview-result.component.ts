import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { Constants } from 'src/app/constant/Constants';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { CommonService } from 'src/app/service/common.service';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { InterviewResultService } from 'src/app/service/interview-result.service';

@Component({
  selector: 'app-popup-interview-result',
  templateUrl: './popup-interview-result.component.html',
  styleUrls: ['./popup-interview-result.component.scss']
})
export class PopupInterviewResultComponent implements OnInit {
  cancelLbl = Constants.cancelLbl;
  noticeLbl = Constants.noticeLbl;
  scheduleId: number | null = null;
  scheduleData: any = {};
  interviewResult: string = 'PASS'; // 'PASS' or 'FAIL'
  feedback: string = '';
  loading: boolean = false;
  
  // Backup storage to prevent data loss - use static to persist across instances
  private static backupScheduleId: number | null = null;
  private static backupScheduleData: any = {};

  constructor(
    private utilsService: UtilsService,
    private commonService: CommonService,
    private interviewResultService: InterviewResultService
  ) {
    // Don't reset data in constructor, just hide the popup
    $('#popup-interview-result .modal').removeClass("display");
    $('#popup-interview-result .modal').addClass("hide");
  }

  ngOnInit(): void {
    // Don't reset data in ngOnInit, just ensure popup is hidden
    $('#popup-interview-result .modal').removeClass("display");
    $('#popup-interview-result .modal').addClass("hide");
  }

  openPopup(scheduleId: number, scheduleData?: any) {
    console.log('=== openPopup called ===');
    console.log('scheduleId param:', scheduleId);
    console.log('scheduleData param:', scheduleData);
    
    // Ensure scheduleId is valid
    if (!scheduleId) {
      console.error('openPopup called without scheduleId');
      // Try to get from scheduleData if available
      if (scheduleData && scheduleData.scheduleId) {
        this.scheduleId = scheduleData.scheduleId;
        console.log('Got scheduleId from scheduleData:', this.scheduleId);
      } else {
        console.error('Cannot open popup: scheduleId is missing');
        return;
      }
    } else {
      this.scheduleId = scheduleId;
    }
    
    this.scheduleData = scheduleData || {};
    this.interviewResult = 'PASS';
    this.feedback = '';
    this.loading = false;
    
    // Save to service (persists across component instances)
    if (this.scheduleId !== null) {
      this.interviewResultService.setScheduleData(this.scheduleId, this.scheduleData);
    }
    
    // Backup data to prevent loss - use static to persist across component instances
    PopupInterviewResultComponent.backupScheduleId = this.scheduleId;
    PopupInterviewResultComponent.backupScheduleData = JSON.parse(JSON.stringify(this.scheduleData)); // Deep copy
    
    // Also save to localStorage as additional backup
    try {
      localStorage.setItem('interview_result_scheduleId', String(this.scheduleId));
      localStorage.setItem('interview_result_scheduleData', JSON.stringify(this.scheduleData));
      console.log('Saved to localStorage - scheduleId:', this.scheduleId);
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
    
    console.log('Popup opened - this.scheduleId:', this.scheduleId, 'this.scheduleData:', this.scheduleData);
    console.log('Static backup - backupScheduleId:', PopupInterviewResultComponent.backupScheduleId);
    console.log('=== end openPopup ===');
    
    $('#popup-interview-result .modal').removeClass("hide");
    $('#popup-interview-result .modal').addClass("display");
    
    // Verify data is still there after a short delay
    setTimeout(() => {
      console.log('Verification after 100ms - this.scheduleId:', this.scheduleId, 'backupScheduleId:', PopupInterviewResultComponent.backupScheduleId);
    }, 100);
  }

  closePopup() {
    $('#popup-interview-result .modal').removeClass("display");
    $('#popup-interview-result .modal').addClass("hide");
    
    // Clear service data when closing
    this.interviewResultService.clear();
    
    // Clear localStorage backup when closing
    try {
      localStorage.removeItem('interview_result_scheduleId');
      localStorage.removeItem('interview_result_scheduleData');
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
    
    this.scheduleId = null;
    this.scheduleData = {};
    this.interviewResult = 'PASS';
    this.feedback = '';
  }

  onResultChange(result: string) {
    this.interviewResult = result;
  }

  onSubmit() {
    console.log('=== onSubmit called ===');
    console.log('this.scheduleId:', this.scheduleId, 'this.scheduleData:', this.scheduleData);
    
    // Priority 1: Try to restore from service (most reliable)
    const serviceScheduleId = this.interviewResultService.getScheduleId();
    const serviceScheduleData = this.interviewResultService.getScheduleData();
    
    if (!this.scheduleId && serviceScheduleId) {
      console.log('Restoring scheduleId from service:', serviceScheduleId);
      this.scheduleId = serviceScheduleId;
    }
    
    if ((!this.scheduleData || Object.keys(this.scheduleData).length === 0) && 
        serviceScheduleData && Object.keys(serviceScheduleData).length > 0) {
      console.log('Restoring scheduleData from service');
      this.scheduleData = JSON.parse(JSON.stringify(serviceScheduleData));
    }
    
    // Priority 2: Try to restore from localStorage
    try {
      const savedScheduleId = localStorage.getItem('interview_result_scheduleId');
      const savedScheduleData = localStorage.getItem('interview_result_scheduleData');
      
      if (!this.scheduleId && savedScheduleId) {
        console.log('Restoring scheduleId from localStorage:', savedScheduleId);
        this.scheduleId = Number(savedScheduleId);
      }
      
      if ((!this.scheduleData || Object.keys(this.scheduleData).length === 0) && savedScheduleData) {
        console.log('Restoring scheduleData from localStorage');
        this.scheduleData = JSON.parse(savedScheduleData);
      }
    } catch (e) {
      console.warn('Failed to restore from localStorage:', e);
    }
    
    // Priority 3: Restore from static backup if data was lost
    if (!this.scheduleId && PopupInterviewResultComponent.backupScheduleId) {
      console.log('Restoring scheduleId from static backup:', PopupInterviewResultComponent.backupScheduleId);
      this.scheduleId = PopupInterviewResultComponent.backupScheduleId;
    }
    
    if ((!this.scheduleData || Object.keys(this.scheduleData).length === 0) && 
        PopupInterviewResultComponent.backupScheduleData && Object.keys(PopupInterviewResultComponent.backupScheduleData).length > 0) {
      console.log('Restoring scheduleData from static backup');
      this.scheduleData = JSON.parse(JSON.stringify(PopupInterviewResultComponent.backupScheduleData));
    }
    
    // Priority 4: Try to get scheduleId from scheduleData if not set
    if (!this.scheduleId) {
      if (this.scheduleData && this.scheduleData.scheduleId) {
        this.scheduleId = this.scheduleData.scheduleId;
        console.log('Retrieved scheduleId from scheduleData:', this.scheduleId);
      } else {
        console.error('Missing scheduleId - scheduleId:', this.scheduleId, 'scheduleData:', this.scheduleData);
        console.error('Service - scheduleId:', serviceScheduleId, 'scheduleData:', serviceScheduleData);
        console.error('Static backup - backupScheduleId:', PopupInterviewResultComponent.backupScheduleId);
        alert('Không tìm thấy thông tin lịch phỏng vấn. Vui lòng thử lại.');
        this.loading = false;
        return;
      }
    }

    if (!this.scheduleData || Object.keys(this.scheduleData).length === 0) {
      console.error('Missing scheduleData - scheduleId:', this.scheduleId, 'scheduleData:', this.scheduleData, 'backupScheduleData:', PopupInterviewResultComponent.backupScheduleData);
      alert('Thiếu thông tin lịch phỏng vấn. Vui lòng thử lại.');
      this.loading = false;
      return;
    }

    this.loading = true;

    // Prepare body to update schedule with interview result
    // Status: 2 (CHOSEN) if PASS, -1 (FAILED) if FAIL
    const statusValue = this.interviewResult === 'PASS' ? String(ConstantsApp.CHOSEN) : String(ConstantsApp.FAILED);
    
    // Ensure we have all required fields
    const freelancerId = this.scheduleData.freelancerId || this.scheduleData.userId || this.scheduleData.id;
    const jobId = this.scheduleData.jobId;
    
    if (!freelancerId || !jobId) {
      console.error('Missing required fields - scheduleId:', this.scheduleId, 'freelancerId:', freelancerId, 'jobId:', jobId);
      console.error('scheduleData:', this.scheduleData);
      this.loading = false;
      alert('Thiếu thông tin cần thiết. Vui lòng thử lại.');
      return;
    }
    
    // Build request body - scheduleId is required for update
    let body: any = {
      scheduleId: this.scheduleId,
      freelancerId: freelancerId,
      jobId: jobId,
      status: statusValue,
      interviewResult: this.interviewResult,
      feedback: this.feedback || null
    };
    
    // Add optional fields if they exist
    if (this.scheduleData.topic) body.topic = this.scheduleData.topic;
    if (this.scheduleData.des) body.des = this.scheduleData.des;
    if (this.scheduleData.address || this.getAddress()) body.address = this.scheduleData.address || this.getAddress();
    if (this.scheduleData.startDate) body.startDate = this.scheduleData.startDate;
    if (this.scheduleData.endDate) body.endDate = this.scheduleData.endDate;
    if (this.scheduleData.type !== undefined) body.type = this.scheduleData.type;
    if (this.scheduleData.interviewMethod !== undefined) body.interviewMethod = this.scheduleData.interviewMethod;
    if (this.scheduleData.meetId) body.meetingId = this.scheduleData.meetId;
    if (this.scheduleData.meetUrl) body.meetUrl = this.scheduleData.meetUrl;
    if (this.scheduleData.passcode) body.passcode = this.scheduleData.passcode;

    console.log('Submitting interview result with body:', body);

    const functionName = 'submitInterviewResult';
    const messageLog = 'submit interview result';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_SCHEDULE_SAVE;

    this.commonService
      .postDatas(body, apiUrl, functionName, messageLog)
      .subscribe(
        (res: any) => {
          this.loading = false;
          if (res && (res.status === ConstantsApp.CREATED || res.status === 'UPDATED')) {
            this.closePopup();
            // Optionally refresh the page or emit event to parent
            window.location.reload();
          } else {
            console.error('Failed to save interview result:', res);
          }
        },
        (error) => {
          this.loading = false;
          console.error('API error:', error);
        }
      );
  }

  getAddress(): string {
    if (this.scheduleData.province && this.scheduleData.ward) {
      return `${this.scheduleData.ward}, ${this.scheduleData.province}`;
    } else if (this.scheduleData.province) {
      return this.scheduleData.province;
    }
    return '';
  }
}


