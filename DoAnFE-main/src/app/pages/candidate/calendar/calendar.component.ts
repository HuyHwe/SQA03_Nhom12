import { CalendarOptions, EventContentArg } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ApiNameConstants } from '../../../constant/ApiNameConstants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { CommonService } from '../../../service/common.service';
import { UtilsService } from "../../../helper/service/utils.service";
import { PopupCalendarItemComponent } from './popup-calendar-item/popup-calendar-item.component'; // Đảm bảo đúng đường dẫn
import { PopupInterviewResultComponent } from '../../recruiter/candidate-management/table-candidate/popup-interview-result/popup-interview-result.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarCandidateComponent implements OnInit, OnDestroy {
  @ViewChild('fullCalendar') fullCalendar: FullCalendarComponent;
  @ViewChild('popupCalendarItem') popupCalendarItem: PopupCalendarItemComponent;
  @ViewChild('popupInterviewResult') popupInterviewResult: PopupInterviewResultComponent;
  startDate: any = this.utilsService.formatDate(this.utilsService.getStartAndEndOfWeek().startDate);
  endDate: any = this.utilsService.formatDate(this.utilsService.getStartAndEndOfWeek().endDate);
  dateForm: FormGroup;
  dataTable: any[] = [];

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    weekends: true,
    allDaySlot: false,
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00:00',
    headerToolbar: false,
    height: '100%',
    scrollTime: '08:00:00',
    expandRows: true,
    selectable: true,
    slotEventOverlap: false,
    eventMinHeight: 70,
    eventContent: this.customEventContent.bind(this),
    // Gọi hàm xử lý khi click vào event
    eventClick: this.handleEventClick.bind(this),
    events: []
  };

  constructor(private commonService: CommonService, private utilsService: UtilsService) {
    this.dateForm = new FormGroup({
      startDate: new FormControl(this.startDate, [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.initData();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  initData() {
    const body = {
      startDate: this.utilsService.formatLocalDateTime(this.startDate),
      endDate: this.utilsService.formatLocalDateTime(this.endDate),
      statuses: [ConstantsApp.PASSED, ConstantsApp.FAILED, ConstantsApp.INTERVIEWED, ConstantsApp.INTERVIEW_PROCESSING, ConstantsApp.CANCELED],
    };
    this.getData(body);
  }

  getData(body: any) {
    const apiUrl = environment.API_URI + ApiNameConstants.BS_SCHEDULE_CALENDAR;
    this.commonService.postDatas(body, apiUrl, 'getData', 'get calendars')
      .subscribe((res: any) => {
        if (res && res.data) {
          this.dataTable = res.data;
          this.buildCalendarEvent(res.data);
        }
      });
  }

  adjustTimeZone(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setHours(date.getHours() - 5);
    return date.toISOString();
  }

  buildCalendarEvent(data: any[]) {
    const events = data.map(item => ({
      id: item.id,
      title: item.jobName,
      start: this.adjustTimeZone(item.startDate),
      end: this.adjustTimeZone(item.endDate),
      extendedProps: {
        jobId: item.jobId,          
        userId: item.userId,
        userName: item.userName,
        isOnline: item.interviewMethod,
        // Lưu thêm các props cần thiết cho popup nếu cần
        province: item.province,
        ward: item.ward
      }
    }));
    this.calendarOptions = { ...this.calendarOptions, events: events };
  }


  handleEventClick(arg: any) {
    const eventData = {
      id: arg.event.id,
      ...arg.event.extendedProps,
      startDate: arg.event.start, // FullCalendar đã parse thành đối tượng Date
      endDate: arg.event.end
    };

    const now = new Date();
    const eventStartDate = new Date(arg.event.start -5);

    // So sánh thời gian
    if (eventStartDate > now) {
      // Trường hợp 1: Chưa đến giờ phỏng vấn -> Hiện chi tiết (Popup cũ)
      if (this.popupCalendarItem) {
        this.popupCalendarItem.openPopup(eventData);
      }
    } else {
      // Trường hợp 2: Đã hoặc đang phỏng vấn -> Hiện nhập kết quả (Popup mới)
      if (this.popupInterviewResult) {
        // Lưu ý: Đảm bảo truyền đúng ID và data mà PopupInterviewResult yêu cầu
        console.log("evetDate: ",eventData);
        this.popupInterviewResult.openPopup(eventData.id, eventData);
      }
    }
  }

  customEventContent(arg: EventContentArg) {
    const isOnline = arg.event.extendedProps['isOnline'];
    const userName = arg.event.extendedProps['userName'] || 'Unknown';
    const colorClass = isOnline ? 'blue' : 'green';

    const content = document.createElement('div');
    content.className = `event-card-container ${colorClass}`;
    content.innerHTML = `
      <div class="event-inner-wrapper">
        <div class="event-time-row">${arg.timeText}</div>
        <div class="event-title-row" title="${arg.event.title}">${arg.event.title}</div>
        <div class="event-user-row">
           <span class="user-icon">👤</span>
           <span class="user-name">${userName}</span>
        </div>
        <div class="event-type-badge">${isOnline ? 'Online' : 'Offline'}</div>
      </div>
    `;
    return { domNodes: [content] };
  }

  onChoseStartDate(date: any) {
    if (!date) return;
    const calApi = this.fullCalendar.getApi();
    calApi.gotoDate(new Date(date));
    this.startDate = this.utilsService.formatDate(calApi.view.activeStart);
    this.endDate = this.utilsService.formatDate(calApi.view.activeEnd);
    this.onSearch();
  }

  onSearch() {
    const body = {
      startDate: this.utilsService.formatLocalDateTime(this.startDate),
      endDate: this.utilsService.formatLocalDateTime(this.endDate)
    };
    this.getData(body);
  }

  onResize() {
    const newView = window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek';
    if (this.calendarOptions.initialView !== newView) {
      this.calendarOptions = { ...this.calendarOptions, initialView: newView };
    }
  }
}