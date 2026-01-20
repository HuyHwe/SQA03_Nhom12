import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import {RouterLinkName} from "../constant/RouterLinkName";

@Injectable()
export class CandidateGuardService implements CanActivate, CanActivateChild {
    constructor(
        private authService: AuthService,
        private router: Router
    ) {}


    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
      let isCandidate = this.authService.isCandidate()
      let isRecruiter = this.authService.isRecruiter();
      if (!isCandidate) {
        if (!isRecruiter) {
          return true;
        }
        this.router.navigate(['/'+ RouterLinkName.RECRUITER_HOME]);
      }
      return isCandidate;
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        return this.canActivate(route, state);
    }
}
