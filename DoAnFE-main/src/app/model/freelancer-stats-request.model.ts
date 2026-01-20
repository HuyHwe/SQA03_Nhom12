// models/freelancer-stats-request.model.ts
// Model for request body

export interface FreelancerStatsRequest {
    jobId: number;
  recruiterId: number;

  topK?: number;
}