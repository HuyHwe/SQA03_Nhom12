import { Component, OnInit, ViewChild, Input, OnChanges, Injectable } from '@angular/core';
import { HttpHeaders, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { take, finalize } from 'rxjs/operators';
import { LoaderService } from './loader.service';

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export class LoadingInteceptorService implements HttpInterceptor {
  constructor(private loaderService: LoaderService) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
     this.loaderService.show();
     return next.handle(request).pipe(
           finalize(() => this.loaderService.hide()),
     );
  }
}
