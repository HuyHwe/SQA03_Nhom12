// freelancer-stats.service.ts
// Service to handle API call to backend

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FreelancerStatsRequest } from 'src/app/model/freelancer-stats-request.model';
import { FreelancerStatsResponse } from 'src/app/model/freelancer-stats-response.model';

@Injectable({
  providedIn: 'root'
})
export class FreelancerStatsService {
  private apiUrl = `${environment.API_URI}bs-user/recruiter/stats/by-jobdefault`;  // Adjust endpoint as needed

  constructor(private http: HttpClient) {}

  getFreelancerStatsByJobDefault(request: FreelancerStatsRequest): Observable<FreelancerStatsResponse[]> {
    return this.http.post<FreelancerStatsResponse[]>(this.apiUrl, request);
}
  listJobs(params: { page: number; size: number }) {
  return this.http.post(`${environment.API_URI}bs-user/recruiter/posts`, params); 
}

}