import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${environment.CLOUDINARY.cloud_name}/image/upload`;

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.CLOUDINARY.upload_preset);

    // Đảm bảo không thêm header Authorization
    const headers = new HttpHeaders({
      'X-Requested-With': 'XMLHttpRequest' // Header này thường cần cho CORS
    });

    return this.http.post(this.cloudinaryUploadUrl, formData, { headers });
  }
}