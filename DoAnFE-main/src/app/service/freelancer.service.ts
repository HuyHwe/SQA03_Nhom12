import { Injectable } from "@angular/core";
import { environment } from 'src/environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { UtilsService } from '../helper/service/utils.service';
import { MessageService } from './message-service/message.service';

@Injectable ({
    providedIn: "root"
})

export class FreelancerService {
    constructor(private http: HttpClient, 
        private utilsService: UtilsService,
        private messageService: MessageService
        ) {}
    getListNearestCandidate(body: string, apiUrl: string): Observable<any> {
        const options = {
            headers: this.utilsService.requestHeader()
        } 
        return this.http.post<string>(apiUrl, JSON.parse(body), options)
        .pipe (
            tap(_ => this.log('fetched freelancer ', 'FreelancerService')),
            catchError(this.handleError<any>('getListNearestFreelancer', []))
        );          
    }
    getListNearestFreelancer(body: string, apiUrl: string): Observable<any> {
        const options = {
            headers: this.utilsService.requestHeader()
        } 
        return this.http.post<string>(apiUrl, JSON.parse(body), options)
        .pipe (
            tap(_ => this.log('fetched freelancer ', 'FreelancerService')),
            catchError(this.handleError<any>('getListNearestFreelancer', []))
        );          
    }

    handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.error(error);
            this.log(`${operation} failed: ${error.message}`, 'FreelancerService');
            return of(result as T);
        }
    }

    log(message: string, serviceName : any) {
        this.messageService.add(`${serviceName}: ${message}`);
    }
}