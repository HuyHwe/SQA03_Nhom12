import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import * as $ from 'jquery';
import { Constants } from 'src/app/constant/Constants';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { CommonService } from 'src/app/service/common.service';
import { PopupInterviewResultComponent } from '../popup-interview-result/popup-interview-result.component';

@Component({
  selector: 'app-popup-interview-detail',
  templateUrl: './popup-interview-detail.component.html',
  styleUrls: ['./popup-interview-detail.component.scss']
})
export class PopupInterviewDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('popupInterviewResult', { static: false }) popupInterviewResult: PopupInterviewResultComponent;
  
  cancelLbl = Constants.cancelLbl;
  noticeLbl = Constants.noticeLbl;
  scheduleId: number | null = null;
  scheduleData: any = {};
  rowData: any = {}; // Store original row data to get freelancerId
  loading: boolean = false;

  constructor(
    private utilsService: UtilsService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef
  ) {
    this.closePopup();
  }

  ngOnInit(): void {
    this.closePopup();
  }

  ngAfterViewInit(): void {
    // ViewChild should be available here
    this.cdr.detectChanges();
  }

  openPopup(scheduleId: number, rowData?: any) {
    this.scheduleId = scheduleId;
    this.rowData = rowData || {};
    this.scheduleData = {};
    this.loading = true;
    this.getScheduleDetail();
    $('#popup-interview-detail .modal').removeClass("hide");
    $('#popup-interview-detail .modal').addClass("display");
  }

  closePopup() {
    $('#popup-interview-detail .modal').removeClass("display");
    $('#popup-interview-detail .modal').addClass("hide");
    this.scheduleData = {};
    this.scheduleId = null;
  }

  getScheduleDetail() {
    if (!this.scheduleId) {
      this.loading = false;
      return;
    }

    const functionName = 'getScheduleDetail';
    const messageLog = 'get schedule detail by id';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_FIND_SCHEDULE_BY_ID + "?id=" + this.scheduleId;
    
    this.commonService
      .getData(apiUrl, functionName, messageLog)
      .subscribe(
        (res: any) => {
          this.loading = false;
          if (res && res.data) {
            this.scheduleData = res.data;
          }
        },
        (error) => {
          this.loading = false;
          console.error('API error:', error);
        }
      );
  }

  getFormattedDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `Ngày ${day} tháng ${month} năm ${year}`;
  }

  getFormattedTime(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const hours = (d.getHours()-5).toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const period = d.getHours() < 12 ? 'sáng' : 'chiều';
    return `${hours}:${minutes} ${period}`;
  }

  getInterviewMethod(): string {
    if (this.scheduleData.interviewMethod === true || this.scheduleData.interviewMethod === 1) {
      return 'Online';
    } else if (this.scheduleData.interviewMethod === false || this.scheduleData.interviewMethod === 0) {
      return 'Offline';
    }
    return 'Online và Offline';
  }

  getAddress(): string {
    if (this.scheduleData.province && this.scheduleData.ward) {
      return `${this.scheduleData.ward}, ${this.scheduleData.province}`;
    } else if (this.scheduleData.province) {
      return this.scheduleData.province;
    }
    return '';
  }

  onStart() {
    // Open interview result popup and close detail popup
    // Ensure scheduleId is available - use from rowData if not set
    const scheduleIdToUse = this.scheduleId || this.rowData.scheduleId;
    
    if (!scheduleIdToUse) {
      console.error('Missing scheduleId in onStart - scheduleId:', this.scheduleId, 'rowData:', this.rowData);
      alert('Không tìm thấy thông tin lịch phỏng vấn. Vui lòng thử lại.');
      return;
    }
    
    // Merge rowData with scheduleData to ensure we have all required fields
    // Priority: scheduleData > rowData
    const mergedData = {
      ...this.rowData, // Start with rowData (has scheduleId, id, jobId from API)
      ...this.scheduleData, // Override with scheduleData from getScheduleById API
      scheduleId: scheduleIdToUse, // Ensure scheduleId is explicitly set
      freelancerId: this.rowData.id || this.scheduleData.freelancerId || this.scheduleData.userId,
      jobId: this.scheduleData.jobId || this.rowData.jobId
    };
    
    console.log('Opening interview result popup with scheduleId:', scheduleIdToUse);
    console.log('rowData:', this.rowData);
    console.log('scheduleData:', this.scheduleData);
    console.log('mergedData:', mergedData);
    
    // Check if ViewChild is available
    if (!this.popupInterviewResult) {
      console.error('popupInterviewResult ViewChild is not available');
      alert('Lỗi khởi tạo popup. Vui lòng thử lại.');
      return;
    }
    
    // Open popup with data
    this.popupInterviewResult.openPopup(scheduleIdToUse, mergedData);
    
    // Verify data was set
    setTimeout(() => {
      console.log('Verifying popup data after open - scheduleId:', this.popupInterviewResult.scheduleId);
      if (!this.popupInterviewResult.scheduleId) {
        console.error('Popup scheduleId is null after open!');
        // Try to set again
        this.popupInterviewResult.openPopup(scheduleIdToUse, mergedData);
      }
    }, 50);
    
    // Close detail popup after a small delay to ensure result popup is ready
    setTimeout(() => {
      this.closePopup();
    }, 200);
  }
}

