import { Injectable } from "@angular/core";
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { InputItem } from '../model/inputItem';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { UtilsService } from '../helper/service/utils.service';
import { ErrorHandlerService } from 'src/app/common/ErrorHandlerService';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';

import { AuthService } from 'src/app/core/auth/auth.service';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';


@Injectable ({
    providedIn: "root"
})
export class UserService {
    constructor(private http: HttpClient,
        private utilsService: UtilsService,
        private authService: AuthService,
        private localStorageService: LocalStorageService,
        private errorHandlerService: ErrorHandlerService) {
    }

    getUserInfo() {
      return this.http.get(`${environment.API_URI}bs-user/user_common/user-info`, {
        headers: this.utilsService.requestHeaderAuth()
      })
    }
		getUserCommon(userId:number) {
			let paramsMap = new Map();
        paramsMap.set('userId', userId);
        const options = {
            params: new HttpParams().set('userId', userId.toString()),
            headers: this.utilsService.requestHeader()
        }
      return this.http.get(`${environment.API_URI}${ApiNameConstants.BS_USER_COMMON}`, options)
    }
    changePass(body:any): Observable<string>  {
        const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_CHANGE_PASS;
        let headers = this.utilsService.requestHeader();
        headers = headers.append(Constants.authorization, this.authService.getAccessToken())
        const options = {
            headers: this.utilsService.requestHeader()
        }
        return this.http.post<string>(apiUrl, JSON.stringify(body), options)
        .pipe (
            tap(_ => this.errorHandlerService.log('update user ', 'UserService')),
            catchError(this.errorHandlerService.handleError<any>('updateUser', [], 'UserService'))
        );
    }
    /**
     * Multi call in angular
     * @returns
     */
    public retrieveDataHome(searchingSuggestionBody: any, candidatesBody: any, jobBody: any): Observable<any>   {
        let headers = this.utilsService.requestHeader();
        headers = headers.append('Authorization', this.localStorageService.getItem(ConstantsApp.accessToken));
        const options = {
            headers: headers
        }
        let call1 = this.http.post(environment.API_URI + ApiNameConstants.BS_SEARCH_SEARCHING_ALL, JSON.stringify(searchingSuggestionBody), options).pipe (
            tap(_ => this.errorHandlerService.log('update user ', 'UserService')),
            catchError(this.errorHandlerService.handleError<any>('updateUser', [], 'UserService'))
        );
        // todo
        let call2 = this.http.post(environment.API_URI + ApiNameConstants.BS_USER_CANDIDATE, JSON.stringify(candidatesBody), options).pipe (
            tap(_ => this.errorHandlerService.log('update user ', 'UserService')),
            catchError(this.errorHandlerService.handleError<any>('updateUser', [], 'UserService'))
        );
        let call3 = this.http.post(environment.API_URI + ApiNameConstants.BS_MATCH_JOB, JSON.stringify(jobBody), options).pipe (
            tap(_ => this.errorHandlerService.log('update user ', 'UserService')),
            catchError(this.errorHandlerService.handleError<any>('updateUser', [], 'UserService'))
        );
        let getSavedJob = this.http.post(environment.API_URI + ApiNameConstants.BS_RECRUITER_SAVED_CANDIDATE, JSON.stringify(jobBody), options).pipe (
            tap(_ => this.errorHandlerService.log('update user ', 'UserService')),
            catchError(this.errorHandlerService.handleError<any>('updateUser', [], 'UserService'))
        );
        let getSavedFreelancer = this.http.post(environment.API_URI + ApiNameConstants.BS_RECRUITER_SAVED_CANDIDATE, JSON.stringify(jobBody), options).pipe (
            tap(_ => this.errorHandlerService.log('update user ', 'UserService')),
            catchError(this.errorHandlerService.handleError<any>('updateUser', [], 'UserService'))
        );
        return  forkJoin([call1, call2, call3, getSavedJob, getSavedFreelancer]);
    }

    public createUser(body: any) {
        const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_CREATE;
        const options = {
            headers: this.utilsService.requestHeader()
        }
        return this.http.post<string>(apiUrl, JSON.stringify(body), options)
        .pipe (
            tap(_ => this.errorHandlerService.log('create user ', 'createUser')),
            catchError(this.errorHandlerService.handleError<any>('create user', [], 'createUser'))
        );
    }

    public updateUser(body: any, apiUrl: any) {
        const options = {
            headers: this.utilsService.requestHeader()
        }
        return this.http.post<string>(apiUrl, JSON.stringify(body), options)
        .pipe (
            tap(_ => this.errorHandlerService.log('create user ', 'createUser')),
            catchError(this.errorHandlerService.handleError<any>('create user', [], 'createUser'))
        );
    }

    public postDatas(body: any, apiUrl: any, functionName:any, messageLog: any) : Observable<any> {
        return this.http.post<string>(apiUrl, JSON.stringify(body))
        .pipe (
            tap(_ => this.errorHandlerService.log(messageLog, functionName)),
            catchError(this.errorHandlerService.handleError<any>(messageLog, [], functionName))
        );
    }

    public getData(apiUrl: any, functionName:any, messageLog: any) : Observable<Blob> {
        return this.http.get(apiUrl, {
            responseType: 'blob',
            observe: 'response'
          }).pipe (
            tap(_ => this.errorHandlerService.log(messageLog, functionName)),
            catchError(this.errorHandlerService.handleError<any>(messageLog, [], functionName))
        );
    }

}
