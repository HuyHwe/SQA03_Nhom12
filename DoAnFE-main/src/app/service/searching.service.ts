import { Injectable } from "@angular/core";
import { environment } from 'src/environments/environment';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { InputItem } from '../model/inputItem';
import { ApiNameConstants } from '../constant/ApiNameConstants';
import { UtilsService } from '../helper/service/utils.service';
import { ErrorHandlerService } from 'src/app/common/ErrorHandlerService';
import { Constants } from 'src/app/constant/Constants';
import { AuthService } from 'src/app/core/auth/auth.service';
import { UserService } from "./user.service";


@Injectable ({
    providedIn: "root"
})
export class SearchingService {
    constructor(private http: HttpClient, 
        private utilsService: UtilsService, 
        private authService: AuthService, 
        private userService: UserService, 
        private errorHandlerService: ErrorHandlerService) {
    }

    getSearchingSuggestionData(body: any): Observable<string> {
        const apiUrl = environment.API_URI + ApiNameConstants.BS_SEARCH_SEARCHING_ALL;
        const options = {
            headers: this.utilsService.requestHeader()
        } 
        return this.http.post<string>(apiUrl, JSON.stringify(body), options)
        .pipe (
            tap(_ => this.errorHandlerService.log('retrieve searching data ', 'getSearchingSuggestionData')),
            catchError(this.errorHandlerService.handleError<any>('retrieve searching', [], 'getSearchingSuggestionData'))
        );      
    }

    bodyGetJob() {
        let body = {
            "fetch": [],
            "filter": {
              "matchingAnd": {
                "propName": ["values"]
              },
              "matchingOr": {
                "propName": ["values"]
              }
            },
            "sort": [{
                "prop": "",
                "type": "ASC"
            }],
            "paging": {
                "page": 1,
                "size": 100
            }
        }
    }
    inputAddressOnchange() {

    }

}