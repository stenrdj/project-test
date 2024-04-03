import { Injectable } from '@angular/core';
import { HttpClient, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { OktaAuthService } from '@okta/okta-angular';
import { environment } from "../environments/environment";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    isAuthenticated: boolean;
 
    constructor(private oktaAuthService: OktaAuthService,private _http:HttpClient) {
 

    }

    /* intercept(request: HttpRequest<any>, next: HttpHandler) {
        
        const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MjE2NjkxNTMsImlhdCI6MTYyMTIzNzE1MywibmJmIjoxNjIxMjM3MTUzLCJpZGVudGl0eSI6NX0._eDRYjZA1rQdz6XAs3KKKR-dpNSsG21BT1j8rDcZPJQ'; //this.oktaAuthService.getAccessToken();
      
        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`,
                    'Access-Control-Allow-Origin': '*'
                }
            });
        } else {
            // this.oktaAuthService.signOut();
        };
        return next.handle(request);
    } */
    intercept(request: HttpRequest<any>, next: HttpHandler) {
           this.oktaAuthService.isAuthenticated().then((isAuthenticated)=>{
              if(!isAuthenticated) {
                this.oktaAuthService.signInWithRedirect();
               } 
          });
         
         
          
            const token =  this.oktaAuthService.getAccessToken();

            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`,
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-cache'
                }
            });
        
        return next.handle(request);
    }
}
