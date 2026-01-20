import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LocalStorageService } from './local-storage.service';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { UtilsService } from 'src/app/helper/service/utils.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ACTION_URL = `${environment.API_URI}/bs-user/login`;
  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private localStorageService: LocalStorageService,
  ) {

    }

  public signIn(credentials: { username: string; password: string }): Observable<any> {
    let body = {
      bodyGetToken: credentials,
      candidateParams: null,
      searchInput: null
    }
    const url = environment.API_URI + ApiNameConstants.BS_USER_SIGNIN;
    return this.httpClient.post<any>(url, body).pipe(
      map((response: any) => {
        this.setUser(response);
        return response;
      })
    );
  }
	public logout() : Observable<any> {

		const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_LOGOUT;

		return this.httpClient.get(apiUrl).pipe( map((response: any) => {
			if (response.code == ConstantsApp.SUCCESS_CODE) {
        this.signOut();
        return response;
      }
		}))
}
  refreshToken(): Observable<any | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
    //   this.clearUser();
      return of(null);
    }

    return this.httpClient.post<any>(`${this.ACTION_URL}/refresh`, { refreshToken }).pipe(
      map((response) => {
        this.setUser(response);
        return response;
      })
    );
  }

  signOut(): void {
    this.localStorageService.clearAll();
    this.localStorageService.setItem(ConstantsApp.role, 1);
  }

  getAccessToken(): any | null {
    return this.localStorageService.getItem(ConstantsApp.accessToken);
  }

  getRefreshToken(): string | null {
    return this.localStorageService.getItem(ConstantsApp.refreshToken);
  }

  hasAccessTokenExpired(token: any): boolean {
    if (!token) return false;
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp
    return expiry * 1000 > Date.now() && this.localStorageService.getItem(ConstantsApp.accessToken) != null;
  }

  authenticated() : boolean {
    const token = this.getAccessToken();
    return this.hasAccessTokenExpired(token);
  }

  private setUser(response: any): void {
    let user = null, tokenObj = null;
    if (response) {
      user = response.user;
      tokenObj = JSON.parse(response.tokenObj);
      this.updateStorage(tokenObj[ConstantsApp.access_token], tokenObj[ConstantsApp.refresh_token], user);
    }
  }

  public updateStorage(accessToken: string, refreshToken: string, user: any): void {
    if (accessToken) {
      this.localStorageService.setItem(ConstantsApp.accessToken, accessToken);
    }
    if (refreshToken) {
      this.localStorageService.setItem(ConstantsApp.refreshToken, refreshToken);
    }
    if (user) {
      this.localStorageService.setItem(ConstantsApp.user, user);
      this.localStorageService.setItem(ConstantsApp.role, user.role);
    }
    this.localStorageService.setItem(ConstantsApp.language, ConstantsApp.VI);
  }

  setUserLoginWithGoogle(response: any) {
    this.localStorageService.setItem(ConstantsApp.accessToken, response[ConstantsApp.access_token]);
    this.localStorageService.setItem(ConstantsApp.refreshToken, response[ConstantsApp.refresh_token]);
  }

  setUserInfo(user: any) {
    this.localStorageService.setItem(ConstantsApp.user, user);
  }

  private clearUser() {
    this.localStorageService.removeItem(ConstantsApp.accessToken);
    this.localStorageService.removeItem(ConstantsApp.refreshToken);
  }

  isCandidate() {
    // return false;
    return this.localStorageService.getItem(ConstantsApp.role) == ConstantsApp.CANDIDATE;
  }

  isRecruiter() {
    // return true;
    return this.localStorageService.getItem(ConstantsApp.role) == ConstantsApp.RECRUITER;
  }
}
