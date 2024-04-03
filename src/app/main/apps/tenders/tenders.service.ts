import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, forkJoin, Observable, of, throwError, timer } from 'rxjs';
import { environment } from 'environments/environment';
import { catchError, debounceTime, delayWhen, map, retry, retryWhen, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { result } from 'lodash';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class TendersService implements Resolve<any>
{
    tenders: any;
    tendersListerFilterChanged: BehaviorSubject<{}>;
    tenderItemFilterChanged: BehaviorSubject<{}>;

    routeParams: any;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private _snackBar: MatSnackBar
    ) {
        // Set the defaults
        this.tendersListerFilterChanged = new BehaviorSubject({});
        this.tenderItemFilterChanged = new BehaviorSubject({});
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        this.routeParams = route.params;
        this.tenders = [];
        const request$ = [];
        request$.push(this.getTenderItem().pipe(catchError(_ => of(null))))
        if (!this.routeParams.id) {
            request$.push(this.getTendersList().pipe(catchError(_ => of(null))))
        } else {
            request$.push(this.getTenderItemFull().pipe(catchError(_ => of(null))))
        }
        return forkJoin(request$).pipe(
            map(_ => [])
        );
    }

    /**
     * Get Tenders List
     *
     * @returns {Observable}
     */
    getTendersList(): Observable<any> {
        this.tenders = {};
        return forkJoin([this._httpClient.get(environment.api + '/tender')]).pipe(
            shareReplay({ bufferSize: 1, refCount: true }),
            retryWhen(errors => errors.pipe(take(2))),
            map(([internal]: any) => {
                console.log(internal);
                this.tenders = [...internal.objects];
                this.tendersListerFilterChanged.next(this.tenders);
                return this.tenders;
            })
        )
    }
    getTendersName(): Observable<any[]> {
        return this._httpClient.get(environment.api + '/autocomplete/Tender/name,country,counterpart,status').pipe(
            map((x: any[]) => {
                return x.map((rest:String) => {
                    let t=rest.replace(/[)(]/g, '').split(',');
                    return { id: t[0], name: t[1].trim(),country: t[2].trim(),counterpart: t[3].trim(),status: t[4].trim(),raw:t.join(' ') }
                }).sort((a, b) => {
                    if (a.name < b.name) {
                        return -1
                    }
                    if (a.name > b.name) {
                        return 1;
                    }
                    return 0;
                })
            })
        );
    }
    getTendersByName(options: any[]): Observable<any> {
        const q = { "filters": [{ "name": "id", "op": "in", "val": options.map(x => x.id) }] };
        return this._httpClient.get(environment.api + '/tender?q=' + encodeURIComponent(JSON.stringify(q))).pipe(
            tap((x: any) => {
                this.tenders = [...x.objects]
                this.tendersListerFilterChanged.next(this.tenders);
            })
        );
    }
    /**
     * Get Tender item Details
     * 
     * @param {Number} tenderId - Tender's ID if available.
     * @returns {Observable}
     */
    getTenderItemFull(tenderId?: number, options: fullOptions = { loadAssets: true, LoadTasks: true }): Observable<any> {
        const id = tenderId ? tenderId : this.routeParams.id;
        this.tenders = {};
        if (!id) throw new Error("getTenderItemFull : Tender id not correct");
        return this._httpClient.get(environment.api + '/tender/' + id + '/full?light=true').pipe(
            shareReplay({ bufferSize: 1, refCount: true }),
            retryWhen(errors => errors.pipe(take(2))),
            catchError(err => {
                this._snackBar.open("A server error is occured ", null, {
                    duration: 8000,
                    panelClass: ['red-700-bg', 'white-fg']
                })
                return throwError(err);
            }),
            map((response: any) => {
                this.tenders = { ...this.tenders, ...response, id: id };
                // this.tenders = { ... this.tenders , ...this.sortPricingResultsAttr(response),id:id};
                this.tenders['pricings'] = [];
                if (response?.pricings) {
                    this.getExternalPricings(response.pricings);
                }
                this.tenders['assets'] = [];
                if (options.loadAssets && response?.assets && typeof response?.assets[0] == 'number') {
                    this.getAssetsLoaded(response.assets);
                } else {
                    this.tenders.assetsLoaded = true;
                    this.tenders['assets'] = response?.assets;
                }
                this.tenders['tasks'] = [];
                if (options.LoadTasks && response?.tasks) {
                    this.getPricingTaskLoaded(response.tasks);
                }
                this.tenderItemFilterChanged.next(this.tenders)
                return this.tenders;
            } ))
    }
    getExternalPricings(idsList: string[] = []) {
        idsList.map((id) =>
            this._httpClient.get(environment.api + '/pricing/external/' + id)
                .pipe(retryWhen(errors => errors.pipe(take(2))))
                .subscribe((result) => {
                    if (!result) return;
                    this.tenderItemFilterChanged.subscribe((tender)=>{
                        this.tenders = {...tender,...this.tenders}
                    })
                    this.tenders.pricingLoaded = true;
                    this.tenders?.pricings?.push(result);
                    this.tenderItemFilterChanged.next({ ...this.sortPricingResultsAttr(this.tenders), isExternal: true });
                })
        );

    }
    getAssetsLoaded(assetsIds: string[] = []) {
        assetsIds.map((id) =>
            this._httpClient.get(environment.api + '/asset/external/' + id)
                .pipe( retry(2) )
                .subscribe((result) => {
                    if (!result) return;
                    this.tenderItemFilterChanged.subscribe((tender)=>{
                        this.tenders = {...tender,...this.tenders}
                    })
                    this.tenders.assetsLoaded = true;
                    this.tenders?.assets?.push(result);
                    this.tenderItemFilterChanged.next({ ...this.sortPricingResultsAttr(this.tenders) });
                })
        );


    }

    getPricingTaskLoaded(tasks: string[] = []) {
        tasks.map((id) =>
            this._httpClient.get(environment.api + '/pricingtask/external/' + id)
                .pipe(retryWhen(errors => errors.pipe(take(2))))
                .subscribe((result) => {
                    if (!result) return;
                    this.tenderItemFilterChanged.subscribe((tender)=>{
                        this.tenders = {...tender,...this.tenders}
                    })
                    this.tenders.tasksLoaded = true;
                    this.tenders?.tasks?.push(result);
                    this.tenderItemFilterChanged.next({ ...this.sortPricingResultsAttr(this.tenders) });
                })
        );
    }
    /**
     * Get Tender item Details
     * 
     * @param {Number} tenderId - Tender's ID if available.
     * @returns {Promise}
     */
    getTenderItem(tenderId?: number): Observable<any> {
        const id = tenderId ? tenderId : this.routeParams.id;
        this.tenders = {};
        if (!id) {
            return of(null);
        }
        return this._httpClient.get(environment.api + '/tender/' + id).pipe(
            shareReplay({ bufferSize: 1, refCount: true }),
            map(response => {
                this.tenders = { ... this.tenders, ...response, id: id };
                this.tenderItemFilterChanged.next(this.tenders);
                return this.tenders;
            }));
    }
    /**
     * Run Tender pricing Task
     *
     * @returns {Observable<any>}
     */
    getTenderPricingTask(body: any): Observable<any> {
        const formdata = new FormData();
        formdata.append('store', body.store);
        formdata.append('use_subside', body.use_subside);
        formdata.append('year_window_len', body.year_window_len);
        formdata.append('reuse_computed_proxy', body.reuse_computed_proxy);
        formdata.append('estimator_order', body.estimator_order);
        return this._httpClient.post(environment.api + '/tender/external/' + this.routeParams.id + '/pricing_task', formdata).pipe(shareReplay({ bufferSize: 1, refCount: true }))
    }
    /**
     * Create new tender
     *
     * @returns {Observable<any>}
     */
    setNewTender(body: any): Observable<any> {
        return this._httpClient.post(environment.api + '/tender', body).pipe(
            shareReplay({ bufferSize: 1, refCount: true }),
            catchError(err => {
                if (!err?.status) {
                    this._snackBar.open("A server error is occured ", null, {
                        duration: 8000,
                        panelClass: ['red-700-bg', 'white-fg']
                    })
                }
                return throwError(err);
            }));
    }

    /**
    * Update tender
    *
    * @returns {Observable<any>}
    */
    updateTender(body: any): Observable<any> {
        return this._httpClient.put(environment.api + '/tender/' + body.id, body).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    }
    /**
    * Create new Commercial Pricing
    *
    * @returns {Observable<any>}
    */
    setNewCommercialPricing(body: any): Observable<any> {
        return this._httpClient.post(environment.api + '/commercialpricing', body).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    }

    /**
    * Get All regions
    *
    * @returns {any[]}
    */
    getRegionsList(): any[] {
        const regions = [{ "name": "Auvergne-Rhône-Alpes", "country": "FR" }, { "name": "Bourgogne-Franche-Comté", "country": "FR" }, { "name": "Bretagne", "country": "FR" }, { "name": "Centre-Val de Loire", "country": "FR" }, { "name": "Grand Est", "country": "FR" }, { "name": "Hauts-de-France", "country": "FR" }, { "name": "Ile-de-France", "country": "FR" }, { "name": "Normandie", "country": "FR" }, { "name": "Nouvelle-Aquitaine", "country": "FR" }, { "name": "Occitanie", "country": "FR" }, { "name": "Pays de la Loire", "country": "FR" }, { "name": "PACA", "country": "FR" }, { "name": "BW", "country": "DE" }, { "name": "SL", "country": "DE" }, { "name": "RP", "country": "DE" }, { "name": "NRW", "country": "DE" }, { "name": "NI", "country": "DE" }, { "name": "SH", "country": "DE" }, { "name": "HE", "country": "DE" }, { "name": "BY", "country": "DE" }, { "name": "NDS", "country": "DE" }, { "name": "MV", "country": "DE" }, { "name": "BB", "country": "DE" }, { "name": "SA", "country": "DE" }, { "name": "SN", "country": "DE" }, { "name": "TH", "country": "DE" }, { "name": "Default_BE", "country": "BE" }, { "name": "Default_NL", "country": "NL" }, { "name": "Default_ES", "country": "ES" }, { "name": "Center North", "country": "IT" }, { "name": "Center South", "country": "IT" }, { "name": "North", "country": "IT" }, { "name": "Sardegna", "country": "IT" }, { "name": "Sicily", "country": "IT" }, { "name": "South", "country": "IT" }, { "name": "HB", "country": "DE" }, { "name": "North Sea", "country": "DE" }, { "name": "Baltic See", "country": "DE" }, { "name": "B", "country": "DE" }];

        return regions;
    }

    /**
    * Get All Pricing Tasks and Risks
    *
    * @returns {any[]}
    */
    getPricingTasksAndRisksList(): any[] {
        const list = [{ "pricing_type": "M0", "risks": ["DeltaProfileCost", "BalancingCost", "SetupFee"] }, { "pricing_type": "fix", "risks": ["ProfileCostM2H", "BalancingCost", "MarketPrice", "ProfileCostY2M", "SetupFee", "P50Provision", "Y2MProvision"] }, { "pricing_type": "fwd-idx", "risks": ["ProfileCostM2H", "BalancingCost", "ProfileCostY2M", "SetupFee", "P50Provision", "Y2MProvision"] }, { "pricing_type": "da-idx", "risks": ["BalancingCost", "SetupFee"] }, { "pricing_type": "mkwt", "risks": ["DeltaProfileCost", "BalancingCost", "SetupFee"] }, { "pricing_type": "mkwt-Art-51-paying-mkwt", "risks": ["DeltaProfileCost", "A51_DeltaProfileCost", "BalancingCost", "SetupFee"] }, { "pricing_type": "mkwt-Art-51-paying-0", "risks": ["DeltaProfileCost", "A51_DeltaProfileCost", "A51_Paying0", "BalancingCost", "SetupFee"] }, { "pricing_type": "click-da-settlement", "risks": ["BalancingCost", "SetupFee"] }, { "pricing_type": "fix_solar_shape", "risks": ["BalancingCost", "SetupFee", "IntermittencyProfileCost", "P50Provision"] }, { "pricing_type": "SDE", "risks": ["DeltaProfileCost", "SetupFee"] }, { "pricing_type": "belwind", "risks": ["ProfileCostM2H", "BalancingCost", "ProfileCostY2M"] }, { "pricing_type": "CPPA_fix", "risks": ["ProfileCostM2H", "MarketPrice", "ProfileCostY2M", "P50Provision", "Y2MProvision"] }, { "pricing_type": "norther", "risks": ["BalancingCost"] }, { "pricing_type": "click", "risks": ["ProfileCostM2H", "BalancingCost", "ProfileCostY2M", "SetupFee", "P50Provision", "Y2MProvision"] }, { "pricing_type": "northwind", "risks": ["ProfileCostM2H", "BalancingCost", "ProfileCostY2M"] }, { "pricing_type": "test_imb (DONT USE)", "risks": ["BalancingCost"] }, { "pricing_type": "CPPA_da-idx", "risks": ["BalancingCost"] }, { "pricing_type": "fwd-idx-da-settlement", "risks": ["BalancingCost", "SetupFee"] }];

        return list;
    }

    /**
    * Create new pricing Object
    *
    * @returns {Observable<any>}
    */
    createNewPricingObject(body: any, id: number): Observable<any> {
        return this._httpClient.post(environment.api + '/tender/' + id + '/pricing', body).pipe(
            map(res => {
                 if(!this.tenders?.pricings)
                    this.tenders['pricings'] = [];
                this.tenders.pricingLoaded = true;
                 this.tenders.pricings.push(res);
                 
                this.tenderItemFilterChanged.next({ ...this.sortPricingResultsAttr(this.tenders) });
                return res;
            }),
             
            
        )
    }

    /**
    * Create new TenderOffer
    *
    * @returns {Observable<any>}
    */
    createNewTenderOffer(body: any): Observable<any> {
        return this._httpClient.post(environment.api + '/clientoffer', body).pipe(
            shareReplay({ bufferSize: 1, refCount: true }),
            catchError(err => {
                if (!err?.status) {
                    this._snackBar.open("A server error is occured ", null, {
                        duration: 8000,
                        panelClass: ['red-700-bg', 'white-fg']
                    })
                }
                return throwError(err);
            }));
    }


    /**
    * Delete TenderOffer
    *
    * @returns {Observable<any>}
    */
    deleteTenderOffer(id: number): Observable<any> {
        return this._httpClient.delete(environment.api + '/clientoffer/' + id).pipe(
            shareReplay({ bufferSize: 1, refCount: true }),
            switchMap(response => this.getTenderItem().pipe(
                map(_ => response)
            ))
        );
    }



    /**
     * Sort Pricing results according to Ticket  GRES-599
     *
     */
    sortPricingResultsAttr(tender: any): any {
        tender = JSON.parse(JSON.stringify(tender));
        if (!tender?.pricings || !tender?.pricings?.length || typeof tender.pricings[0] != 'object') {
            return tender;
        }

        let sortedPrice;
        const firstCols = ['CAP', 'LF', 'VOL_MARK', 'P50_PROXY', 'XBC_ADJ', 'NEG_VALUE_ADJ', 'XMO', 'XMO_Q25', 'XMO_Q75'];
        const lasCols = ['XBC', 'XDPC', 'XPC', 'PPA_XPC', 'PPA_XBC', 'PPA_BETA', 'MP', 'INDIC', 'NEG_VALUE', 'BETA'];

        tender.pricings = tender.pricings.map((pricing: any) => {
            if(!pricing?.results)
                return pricing;
            pricing.results = Object.values(pricing.results).map((price: any, index) => {
                sortedPrice = [];
                firstCols.forEach(col => {
                    if (price[col]) sortedPrice.push({ [col]: price[col] });
                });

                Object.entries(price).map((item) => {
                    if (!firstCols.includes(item[0]) && !lasCols.includes(item[0]))
                        sortedPrice.push({ [item[0]]: item[1] });
                });
              
                lasCols.forEach(col => {
                    if (price[col]) sortedPrice.push({ [col]: price[col] });
                });

                return [...sortedPrice];
            });
            return pricing;
        });

        return tender;
    }
    /**
    * update
    *
    */
    updateTenderPricingResault(resaultID: Number, result: any): Observable<any> {
        const data = { "pricing_bricks": result }
        return this._httpClient.post(environment.api + '/pricingresult/external/' + resaultID, data).pipe(shareReplay({ bufferSize: 1, refCount: true }))
    }
    /**
    * Get accounts List from Referential API
    */
    getAccountsListFromReferential(search: string): Observable<any> {
        return this._httpClient.get(environment.referentialApi + '/api/accounts/search?search=' + search).pipe(
            debounceTime(1000),
            shareReplay({ bufferSize: 1, refCount: true }))
    }
    /**
    * Get Opportunities from GemForce by account ID
    */
    getOpportunitiesFromGemForce(accountId: number): Observable<any> {
        return this._httpClient.get(environment.gemforceApi + '/gemforce/Opportunities?accountId=' + accountId + '&stageId=Propose').pipe(
            shareReplay({ bufferSize: 1, refCount: true })
        );
    } /**
         * Download assets
         */
    downloadAssetsFile(id): any {

        this._httpClient.get(environment.api + '/tender/' + id + '/export_description', {
            responseType: 'arraybuffer'
        })
            .pipe(shareReplay({ bufferSize: 1, refCount: true }))
            .subscribe(response => {
                this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", this.tenders.name + "_assets")
            });

    }
    downLoadFile(data: any, type: string, name: string) {
        let blob = new Blob([data], { type: type });
        let url = window.URL.createObjectURL(blob);
        var fileLink = document.createElement('a');
        fileLink.href = url;
        fileLink.download = name;
        fileLink.click();

    }
    /**
     * Run Trasnfert to GECO
     */
    transferToGeco(id): any {
        this._httpClient.get(environment.api + '/tender/' + id + '/synchronize').pipe(shareReplay({ bufferSize: 1, refCount: true })).subscribe(response => response);

    }
    /**
     * upload the time series file 
     * @param data - Object : {File : file path , filename : string , tender_id:int ,site_id:int , asset_id:int }
     */
    setTimeSeriesFile(data): any {
        const formdata = new FormData();
        formdata.append('file', data.file);
        formdata.append('filename', data.filename);
        formdata.append('tender_id', data.tender_id);
        if (data.site_id)
            formdata.append('site_id', data.site_id);
        if (data.asset_id)
            formdata.append('asset_id', data.asset_id);

        return this._httpClient.post(environment.api + '/fielddatafile/upload', formdata, { reportProgress: true }).pipe(shareReplay({ bufferSize: 1, refCount: true }));

    }
    listTimeSeriesFiles(): Observable<any> {
        return this._httpClient.get(environment.api + '/fielddatafile').pipe(shareReplay({ bufferSize: 1, refCount: true }));
    }
    removeTender(id: number): Observable<any> {
        return this._httpClient.delete(environment.api + '/tender/' + id).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    }

    downloadTimeSerieFile(fileId: number, name: string): void {

        this._httpClient.get(environment.api + '/fielddatafile/' + fileId, {
            responseType: 'arraybuffer', observe: 'response'
        }).pipe(shareReplay({ bufferSize: 1, refCount: true }))
            .subscribe((response: any) => {
                this.downLoadFile(response.body, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", name)
            });

    }
    


}
interface fullOptions {
    loadAssets: boolean,
    LoadTasks: boolean
}