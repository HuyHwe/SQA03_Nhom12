import { Injectable } from "@angular/core";
import { environment } from 'src/environments/environment';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from 'src/app/common/ErrorHandlerService';
import { ApiNameConstants } from "src/app/constant/ApiNameConstants";
import { UtilsService } from "src/app/helper/service/utils.service";
import { CommonService } from "src/app/service/common.service";


@Injectable ({
    providedIn: "root"
})
export class UserDetailService {
    constructor(private http: HttpClient,
        private utilsService: UtilsService,
        private commonService: CommonService,
        private errorHandlerService: ErrorHandlerService) {
    }

    public retrieveData(body: any): Observable<any> {
        // let params = this.utilsService.requestParam(body);
        let uri = environment.API_URI + ApiNameConstants.BS_USER_SEARCH;
        let call1 = this.http.post<string>(uri, JSON.stringify(body)).pipe (
            tap(_ => this.errorHandlerService.log('search user by phone', 'retrieveData')),
            catchError(this.errorHandlerService.handleError<any>('retrieveData', [], 'retrieveData'))
        );
        let call2 = this.commonService.getAllProvince();
        return  forkJoin([call1, call2]);
    }

}
