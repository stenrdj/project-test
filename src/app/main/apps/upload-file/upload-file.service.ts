import { HttpClient, HttpEventType, HttpHeaderResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { map, shareReplay, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Tender } from '../models/Tender';
import { MatSnackBar } from '@angular/material/snack-bar';
import { base64ToArrayBuffer } from 'app/helpers/tenderHelpers';

@Injectable({
    providedIn: 'root'
})
export class UploadFileService {
    validationFileContent: any;
    base64ToArrayBuffer = base64ToArrayBuffer;
    constructor(private http: HttpClient, private _snackBar: MatSnackBar) {
        // .subscribe(test => console.log(test))git push --set-upstream origin feature/dev
    }

    getTenders(): Observable<any> {
        return this.http.get<any>(environment.api + '/tender').pipe(
            map(responses => responses.objects.reverse())
        );
    }

    getImportConfig() {
        return this.http.get(environment.api + '/importconfiguration');
    }

    setImportConfig(id: number, body: any) {
        return this.http.put(environment.api + '/importconfiguration/' + id, body);
    }

    getColsFromUploadedFile(importFileId: string) {
        return this.http.get<string[]>(environment.api + '/importfile/' + importFileId + '/parse_headers');
    }
    getUploadedFile(importFileId: string) {
        return this.http.get<any>(environment.api + '/importfile/' + importFileId);
    }
    getPreview(importFileId: string) {
        return this.http.get(environment.api + '/importfile/' + importFileId + '/preview')
    }
    uploadFile(uploadedFile: File, file: any): Observable<any> {
        const formdata = new FormData();
        formdata.append('file', uploadedFile);
        formdata.append('tender_id', file.tender_id);
        formdata.append('filename', file.filename);
        if (file.ImportConfiguration)
            formdata.append('ImportConfiguration', file.ImportConfiguration);


        const req = new HttpRequest('POST', `${environment.api}/importfile/upload`, formdata, {
            reportProgress: true
        });

        const res = { progress: 0, response: null };

        const progress = new Subject<any>();

        this.http.request(req).subscribe((event) => {
            if (event.type === HttpEventType.UploadProgress) {
                const percentDone = Math.round(100 * event.loaded / event.total);
                res.progress = percentDone;
                if (percentDone != 100) {
                    progress.next(res);
                }
            } else if (event instanceof HttpResponse) {
                res.response = event.body;
                progress.next(res);
                progress.complete();

            }
        }, (err) => {
            res.response = err.error;
            progress.next(res);
            progress.complete();
        });
        return progress.asObservable();
    }
    validateImportedFile(importFileId: number) {
        this.downLoadFile(this.validationFileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    }
    downLoadFile(data: any, type: string) {
        let blob = new Blob([data], { type: type });
        let url = window.URL.createObjectURL(blob);

        let pwa = window.open(url);
        if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
            alert('Please disable your Pop-up blocker and try again.');
        }
    }
    /**
     * Check file validation status 
     *
     * status 200 OK /  201 failed
     * 
     * @returns {Promise<any>}
     */
    checkFileValidationStatus(importFileId: number): Promise<any> {

        return new Promise((resolve, reject) => {
            this.http.get(environment.api + '/importfile/' + importFileId + '/validation?response_as_json=true', {
                observe: 'response'
            }).pipe(distinctUntilChanged()).subscribe((response: any) => {
                    console.log(response);
                    this.validationFileContent = this.base64ToArrayBuffer(response.body.blob);

                    resolve(response);
                }, reject);
        });
    }
    
    /**
    * Build uploaded file after validation
    *
    * 
    * @returns {Promise<any>}
    */
    triggerBuildUploadedValidatedFile(importFileId: number): Promise<any> {


        return new Promise((resolve, reject) => {
            this.http.post(environment.api + '/importfile/' + importFileId + '/build', {}).pipe(shareReplay({ bufferSize: 1, refCount: true }))
                .subscribe((response: any) => {
                    console.log(response);
                    resolve(response);
                }, reject);
        }).catch((err) => {
            return err;
        });
    }
}