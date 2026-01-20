import { HttpHeaders, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { Constants } from 'src/app/constant/Constants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { AuthService } from 'src/app/core/auth/auth.service';
import {LocalStorageService} from "../local-storage.service";

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  private requests: HttpRequest<any>[] = [];

  constructor(private authService: AuthService, private localStorageService: LocalStorageService) {

  }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token from the service.
    // const authToken = this.authService.getAccessToken();
    if (request.url.includes('api.cloudinary.com')) {
      return next.handle(request);
    }
    let headers = new HttpHeaders()
    let url = request.url;

    if (url.indexOf('upload') == -1 ) {
      headers = headers.append('Content-Type','application/json');
    }
    headers = headers.append('Access-Control-Allow-Origin', '*');
    if (this.localStorageService && this.localStorageService.getItem(ConstantsApp.user) && this.localStorageService.getItem(ConstantsApp.user).id) {
      let uid = this.localStorageService.getItem(ConstantsApp.user).id + '';
      console.log('uid', uid);
      headers = headers.append(ConstantsApp.UID, uid);
    }
    if (url.indexOf(ApiNameConstants.BS_USER_SIGNIN) == -1
      && url.indexOf(ApiNameConstants.BS_USER_CREATE) == -1
      && url.indexOf(ApiNameConstants.BS_SEARCH_SEARCHING_ALL) == -1
      && url.indexOf(ApiNameConstants.BS_JOB_SEARCH_NEAR_BY) == -1
      && url.indexOf(ApiNameConstants.BS_FREELANCER_SEARCH) == -1
      && url.indexOf(ApiNameConstants.BS_JOB_SEARCH) == -1
      && url.indexOf(ApiNameConstants.BS_SEARCH_ORG) == -1
      && !url.endsWith(ApiNameConstants.BS_USER_CANDIDATE)
      && !url.endsWith(ApiNameConstants.BS_JOB_SEARCH_NEAR_BY)
      && !url.endsWith(ApiNameConstants.BS_RECRUITER_SAVED_CANDIDATE)
      && !url.endsWith(ApiNameConstants.BS_JOB_DEFAULT_SEARCH)
      && !url.endsWith(ApiNameConstants.BS_JOB_CHILDREN_SEARCH)
      && !url.endsWith(ApiNameConstants.BS_GET_ALL_PROVINCES)
      && !url.endsWith(ApiNameConstants.BS_USER_GET_JOB_BY_ID)
      && !url.endsWith(ApiNameConstants.BS_USER_FORGET_PASS)
    //  && url.indexOf(ApiNameConstants.BS_GET_DISTRICS_BY_PROVINCE) == -1
      && url.indexOf(ApiNameConstants.BS_GET_WARDS_BY_PROVINCE) == -1
      && url.indexOf(ApiNameConstants.BS_USER_FREELANCER_GET_BY_ID) == -1
      && url.indexOf(ApiNameConstants.BS_USER_SEARCH) == -1
      && !url.endsWith(ApiNameConstants.BS_MATCH_JOB)) {
      headers = headers.append(Constants.authorization, ConstantsApp.bearer + this.authService.getAccessToken());
    }

    // Clone the request and replace the original headers with
    // cloned headers, updated with the authorization.
    const authReq = request.clone({
      headers: headers
    });
    // send cloned request with header to the next handler.
    return next.handle(authReq);
  }
}
