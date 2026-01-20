import { Injectable } from "@angular/core";
import { environment } from 'src/environments/environment';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from 'src/app/common/ErrorHandlerService';
import { ApiNameConstants } from "src/app/constant/ApiNameConstants";


@Injectable ({
    providedIn: "root"
})
export class ReferralProgramService {
    constructor(private http: HttpClient, 
        private errorHandlerService: ErrorHandlerService) {
    }
    
    public retrieveData(body1: any, body2: any): Observable<any> {
        let call1 = this.http.post(environment.API_URI + ApiNameConstants.BS_PAYMENT_TRANSACTION_HISTORY, JSON.stringify(body1)).pipe (
            tap(_ => this.errorHandlerService.log('update user ', 'UserService')),
            catchError(this.errorHandlerService.handleError<any>('updateUser', [], 'UserService'))
        );
        let call2 = this.http.post(environment.API_URI + ApiNameConstants.BS_USER_INTRODUCED_USERS, JSON.stringify(body2)).pipe (
          tap(_ => this.errorHandlerService.log('update user ', 'UserService')),
          catchError(this.errorHandlerService.handleError<any>('updateUser', [], 'UserService'))
        );
      return  forkJoin([call1, call2]);
    }
}