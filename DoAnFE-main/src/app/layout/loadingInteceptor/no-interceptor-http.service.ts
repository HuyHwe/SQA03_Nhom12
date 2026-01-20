import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NoInterceptorHttpService {
  private http: HttpClient;

  constructor(handler: HttpBackend) {
    this.http = new HttpClient(handler); // Tạo HttpClient không dùng interceptor
  }

  getHttpClient(): HttpClient {
    return this.http;
  }
}