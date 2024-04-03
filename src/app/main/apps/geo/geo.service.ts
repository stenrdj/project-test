import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { EMPTY } from 'rxjs/internal/observable/empty';

import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class GeoService {
  constructor(
    private _httpClient: HttpClient,
    private _snackBar: MatSnackBar,
  ) {}

  uploadRegistryFile(formData: FormData): Observable<any> {
    const file = formData.get("file").toString();
    const country = formData.get("country").toString();
    const upload_registry_endpoints = {"DE": "import_german_registries", 'FR': 'import_french_registries'}
    if(!file || !country){
      this._snackBar.open("File upload or country missing", null, {
        duration: 8000,
        panelClass: ['yellow-700-bg', 'white-fg']
    });
    return EMPTY ;
    }
        
     if(!Object.keys(upload_registry_endpoints).includes(country)){
      this._snackBar.open( "Country not supported , please choose DE or FR", null, {
        duration: 8000,
        panelClass: ['yellow-700-bg', 'white-fg']
    })
      return EMPTY;

     }
    
     return this._httpClient.post(
      environment.geoApi + "/apiv2/"+upload_registry_endpoints[country],
      formData,
      {
        reportProgress: true,
      },
    );
  }

  getRegistriesList(): Observable<any> {
    return this._httpClient.get(environment.geoApi + "/apiv2/registry_values?page=1&per_page=2000").pipe(
      map(
        (results: any) => {
          return results.result;
        },
      ),
    );
  }

  getDealsList(): Observable<any> {
    return this._httpClient.get(environment.geoApi + "/apiv2/deals?page=1&per_page=2000").pipe(
      map(
        (results: any) => {
          return results.Results;
        },
      ),
    );
  }
}
