import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:2000/bs-configuration/job_default/_search';

  constructor(private http: HttpClient) {}

  getCategories(page: number, pageSize: number): Observable<any> {
    const body = {
      levels: [0],
      paging: {
        page: page,
        size: pageSize
      }
    };
    return this.http.post(this.apiUrl, body);
  }
}