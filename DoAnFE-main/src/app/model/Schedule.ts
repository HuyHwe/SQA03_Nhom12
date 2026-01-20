export class Schedule {
  scheduleId: number;
  freelancerId: number;
  jobId: number;
  name: string;
  salary: number;
  creationDate: Date;
  interviewDate: Date;
  startDate: Date;
  endDate: Date;
  topic: string;
  des: string;
  province: string;
  ward: string;
  interviewStartTime: Date;
  interviewEndTime: Date;
  type: number;
  address: string;
  meetingId: string;
  passcode: string;
  linkzoom: string;
  constructor(
    scheduleId: number = 0,
    freelancerId: number = 0,
    jobId: number = 0,
    name: string = '',
    salary: number = 0,
    creationDate: Date = new Date(),
    interviewDate: Date = new Date(),
    startDate: Date = new Date(),
    endDate: Date = new Date(),
    topic: string = '',
    province: string = '',
    ward: string = '',
    interviewStartTime: Date = new Date(),
    interviewEndTime: Date = new Date(),
  ) {
    this.scheduleId = scheduleId;
    this.freelancerId = freelancerId;
    this.jobId = jobId;
    this.name = name;
    this.salary = salary;
    this.startDate = startDate;
    this.endDate = endDate;
    this.topic = topic;
    this.creationDate = creationDate;
    this.interviewDate = interviewDate;
    this.province = province;
    this.ward = ward;
    this.interviewStartTime = interviewStartTime;
    this.interviewEndTime = interviewEndTime;
  }
}
