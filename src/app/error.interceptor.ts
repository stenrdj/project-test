import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { OktaAuthService } from '@okta/okta-angular';
import { environment } from "../environments/environment";
import { catchError } from 'rxjs/operators';
import { throwError, EMPTY } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(
        private _snackBar: MatSnackBar
    ) { }
    intercept(request: HttpRequest<any>, next: HttpHandler) {
        return next.handle(request).pipe(
            catchError((err: HttpErrorResponse) => {
                console.log(err);
                 

                let msg = 'An error is occured';
                if (err?.status && err?.error?.message) {
                    msg = err.error.message;
                }
                
                if(err?.error?.Error)
                    msg = err?.error?.Error;
                
                
                this._snackBar.open(msg, null, {
                    duration: 8000,
                    panelClass: ['yellow-700-bg', 'white-fg']
                })

                if(err?.statusText == 'OK')
                    return EMPTY;

                return throwError(err);
            })
        );
    }
}
