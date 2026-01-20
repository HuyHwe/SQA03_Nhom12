export class CandidateManagement {
  // userId: number;
  id: number;
  jobId: number;
  status: string;
  note: number;
  active: number;
  constructor(
    id: number,
    jobId: number,
    status: string,
    note: number = 1,
    active: number = 1
  ) {
    this.id = id;
    this.jobId = jobId;
    this.status = status;
    this.note = note;
    this.active = active;
  }
}
