import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { OktaAuthService } from '@okta/okta-angular';

@Injectable({
    providedIn: 'root'
})
export class OktaAuthGuard implements CanActivate {
    constructor(
        private okta: OktaAuthService) {
    }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        const authenticated = await this.okta.isAuthenticated();
        if (authenticated) {
            return true;

        }
        this.okta.signInWithRedirect({
            originalUri: '/'
        });
        return false;
    }
}
