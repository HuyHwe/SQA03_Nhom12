import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import {RouterLinkName} from "../constant/RouterLinkName";

@Injectable()
export class RecruiterGuardService implements CanActivate, CanActivateChild {
    constructor(
        private authService: AuthService,
        private router: Router
    ) {}


    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
      let isRecruiter = this.authService.isRecruiter();
      if (!isRecruiter) {
        this.router.navigate(['/'+ RouterLinkName.CANDIDATE_HOME]);
      }
      return isRecruiter;
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        return this.canActivate(route, state);
    }
}
