import { DataSource } from '@angular/cdk/collections';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { isArray } from 'lodash';
import * as moment from 'moment-timezone';;
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';
import { merge } from 'rxjs/internal/observable/merge';
import { debounceTime, distinctUntilChanged, map, skipWhile, takeUntil } from 'rxjs/operators';
import { TendersService } from '../../tenders/tenders.service'

@Component({
    selector: 'app-offers-list',
    templateUrl: './offers-list.component.html',
    styleUrls: ['./offers-list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class OffersListComponent implements OnInit, OnDestroy, AfterViewInit {
    tendersList: any;
    selectedDetails: any = null;
    dataSource: TendersDataSource | null;
    displayedColumns = ['id', 'name', 'totaloffers', 'status'];
    moment: any = moment;
    private _unsubscribeAll: any = new Subject();;



    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;


    constructor(private _tendersService: TendersService, private cdRef: ChangeDetectorRef) {

    }
    ngOnInit(): void {

        if (this.filter?.nativeElement)
            fromEvent(this.filter?.nativeElement, 'keyup')
                .pipe(
                    takeUntil(this._unsubscribeAll),
                    debounceTime(150),
                    distinctUntilChanged()
                )
                .subscribe(() => {
                    if (!this.dataSource) {
                        return;
                    }
                });
    }
    ngAfterViewInit() {
        this.dataSource = new TendersDataSource(this._tendersService, this.paginator, this.sort);
        this.cdRef.detectChanges();
    }
    /**
      * On destroy
      */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
export class TendersDataSource extends DataSource<any>
{
    // Private
    private _filterChange = new BehaviorSubject('');
    private _filteredDataChange = new BehaviorSubject('');

    /**
     * Constructor
     *
     * @param {EcommerceOrdersService} _tendersService
     * @param {MatPaginator} _matPaginator
     * @param {MatSort} _matSort
     */
    constructor(
        private _tendersService: TendersService,
        private _matPaginator: MatPaginator,
        private _matSort: MatSort
    ) {
        super();

        this.filteredData
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // Filtered data
    get filteredData(): any {
        return this._filteredDataChange.value;
    }

    set filteredData(value: any) {
        this._filteredDataChange.next(value);
    }

    // Filter
    get filter(): string {
        return this._filterChange.value;
    }

    set filter(filter: string) {
        this._filterChange.next(filter);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     *
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]> {
        const displayDataChanges = [
            this._tendersService.tendersListerFilterChanged,
            this._matPaginator.page,
            this._filterChange,
            this._matSort.sortChange
        ];

        return merge(...displayDataChanges).pipe(
            skipWhile(_ => !isArray(this._tendersService.tenders)),
            map(() => {

                let data = this._tendersService.tenders.filter((tender) =>
                    tender.offers.length
                ).slice();

                data = this.filterData(data);

                this.filteredData = [...data];

                data = this.sortData(data);

                // Grab the page's slice of data.
                const startIndex = this._matPaginator.pageIndex * this._matPaginator.pageSize;
                return data.splice(startIndex, this._matPaginator.pageSize);
            })
        );

    }

    /**
     * Filter data
     *
     * @param data
     * @returns {any}
     */
    filterData(data): any {
        if (!this.filter) {
            return data;
        }
        return FuseUtils.filterArrayByString(data, this.filter);
    }

    /**
     * Sort data
     *
     * @param data
     * @returns {any[]}
     */
    sortData(data): any[] {
        if (!this._matSort.active || this._matSort.direction === '') {
            return data;
        }

        return data.sort((a, b) => {
            let propertyA: number | string = '';
            let propertyB: number | string = '';

            switch (this._matSort.active) {
                case 'id':
                    [propertyA, propertyB] = [a.id, b.id];
                    break;
                case 'name':
                    [propertyA, propertyB] = [a.name, b.name];
                    break;
                case 'totaloffers':
                    [propertyA, propertyB] = [a.offers.length, b.offers.length];
                    break;

                case 'status':
                    [propertyA, propertyB] = [a.deadline, b.deadline];
                    break;
            }

            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this._matSort.direction === 'asc' ? 1 : -1);
        });
    }

    /**
     * Disconnect
     */
    disconnect(): void {
    }
}