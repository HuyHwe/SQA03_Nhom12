export class ScheduleDetail {
  id: number;
  jobId: number;
  organizationId: number;
  organizationName: string;
  defaultJobName: string;
  jobName: string;
  startDate: any;
  endDate: any;
  expDate: any;
  status: any;
  province: string;
  ward: string;
  userName: string;
  userId: number;
  meetUrl: string;
  meetId: string;
  passcode: string;
  interviewMethod: boolean;

  // Sửa constructor để tất cả tham số đều có giá trị mặc định là null hoặc chuỗi rỗng
  constructor() {
    this.id = 0;
    this.jobId = 0;
    this.organizationId = 0;
    this.organizationName = '';
    this.defaultJobName = '';
    this.jobName = '';
    this.startDate = null;
    this.endDate = null;
    this.expDate = null;
    this.status = '';
    this.province = '';
    this.ward = '';
    this.userName = '';
    this.userId = 0;
    this.meetUrl = '';
    this.meetId = '';
    this.passcode = '';
    this.interviewMethod = false;
  }
}