import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, of } from 'rxjs';

import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { Constants } from 'src/app/constant/Constants';
import { MessageService } from 'src/app/service/message-service/message.service';


@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
    constructor(private messageService: MessageService) {}
    handleError<T>(operation = 'operation', result?: T, className?: any) {
        return (error: any): Observable<T> => {
            console.error(error);
            this.log(`${operation} failed: ${error.message}`, className);
            return of(result as T);
        }
    }

    log(message: string, serviceName : any) {
        this.messageService.add(`${serviceName}: ${message}`);
    }
}