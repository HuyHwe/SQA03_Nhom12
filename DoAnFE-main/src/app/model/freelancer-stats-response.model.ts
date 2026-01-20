// Model matching backend FreelancerStatsResponse (flattened)
export interface FreelancerStatsResponse {
  id: number;
  name: string;
  job: string;
  skillDes: string;
  experienceDes: string;
  jobTarget: string;
  experienceLevel: number;
  skillLevel: number;
  phone: string;
  email: string;
  avatar: string;
  score: number;           // 0-1 scale
  similarityScore: number; // 0-1 scale
  gnnScore: number;        // 0-1 scale
  behaviorBoost: number;   // 0-1 scale
  cvMatchScore?: number;   // optional
}
export interface CandidateListItem {
  id: number;
  name: string;
  job: string;
  avatar: string;
  phone: string;
  email: string;
  experienceLevel: number;
  skillLevel: number;
  jobTarget: string;

  // Info thêm
  skillDes: string;
  experienceDes: string;

  score: number;           // % (0–100)
  similarityScore: number; // % (0–100)
  gnnScore: number;        // % (0–100)
  behaviorBoost: number;   // % (0–100)
  cvMatchScore?: number;
}
