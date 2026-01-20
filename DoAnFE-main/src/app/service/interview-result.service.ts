import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InterviewResultService {
  private scheduleId: number | null = null;
  private scheduleData: any = {};

  setScheduleData(scheduleId: number, scheduleData: any) {
    this.scheduleId = scheduleId;
    this.scheduleData = scheduleData;
    console.log('InterviewResultService - Data saved:', { scheduleId, scheduleData });
  }

  getScheduleId(): number | null {
    return this.scheduleId;
  }

  getScheduleData(): any {
    return this.scheduleData;
  }

  clear() {
    this.scheduleId = null;
    this.scheduleData = {};
  }
}

