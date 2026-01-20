import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';

@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild {
    constructor(
        private authService: AuthService,
        private router: Router
    ) {}


    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        // todo comment
        let authenticated = this.authService.authenticated();
        if (authenticated) {
            return true;
        } else {
            this.router.navigate(["/app-login"]);
            return false;
        }
        // return true;
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        return this.canActivate(route, state);
    }
}