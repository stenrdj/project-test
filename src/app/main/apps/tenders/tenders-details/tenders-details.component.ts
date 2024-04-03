import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { TendersService } from '../tenders.service';
import { PricingTaskDialogComponent } from '../pricing-task-dialog/pricing-task-dialog.component';
import { CommericialPricingDialogComponent } from "../commericial-pricing-dialog/commericial-pricing-dialog.component";
import { fuseAnimations } from '@fuse/animations';
import * as moment from 'moment-timezone';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { PricingObjectDialogComponent } from '../pricing-object-dialog/pricing-object-dialog.component';
import { Router } from '@angular/router';
import { getPriceDateDifference } from '../../../../helpers/dateHelper';
import { isCurrentUserOriginator, isCurrentUserTrader } from '../../../../helpers/oktaUserHelper';
import { getAttributesForAssetsTable, getAttributesForPricingTable, getPriceIdFromPricingResults, getTaskByPriceID, isPriceResultApproved, transformUpdatedResultToKeyValue , formatComment ,isEventComment} from 'app/helpers/tenderHelpers';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';
import { ScrumboardService } from '../../scrumboard/scrumboard.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TimeSeriesDialogComponent } from './../time-series-dialog/time-series-dialog.component';
import { RemoveTenderDialogComponent } from '../remove-tender-dialog/remove-tender-dialog.component';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-tenders-details',
  templateUrl: './tenders-details.component.html',
  styleUrls: ['./tenders-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class TendersDetailsComponent implements OnInit, OnDestroy {
  tender: any = {};
  filtredTender: any = {};
  moment: any = moment;
  environment: any = environment;
  assetsDescriptionAttr: any = {};
  pricingDescriptionAttr: any = {};
  selectedFilters: string[] = [];
  filterForm = new FormControl();
  filtersList: string[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  displayedPricingIcon: string;
  showFullPricingHistory: boolean = false;
  selectedTab = new FormControl(0);
  checkedCheckboxes: any = [];
  displayedCheckboxId: number = null;
  getPriceDateDifference = getPriceDateDifference;
  getPriceIdFromPricingResults = getPriceIdFromPricingResults;
  isPriceResultApproved = isPriceResultApproved;
  transformUpdatedResultToKeyValue = transformUpdatedResultToKeyValue;
  getTaskByPriceID = getTaskByPriceID;
  formatComment = formatComment;
  isEventComment = isEventComment;
  isCurrentUserOriginator: any;
  isCurrentUserTrader: any;
  isFirstCallLoaded: boolean = false;
  JSON = window.JSON;
  isTenderStillLoading: boolean = true;
  @ViewChild('filterInput') filterInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  objectKeys = Object.keys;
  objectValues = Object.values;
  destroy = new Subject();


  constructor(public _tenderService: TendersService,
    public dialog: MatDialog,
    private router: Router,
    private _snackBar: MatSnackBar,
    private _scrumboardService: ScrumboardService) {
    this.isCurrentUserOriginator = isCurrentUserOriginator();
    this.isCurrentUserTrader = isCurrentUserTrader();
    if (this.router.getCurrentNavigation().extras.state) {
      this.selectedTab.setValue(3);
      console.log(this.selectedFilters, this.router.getCurrentNavigation().extras.state.ids);
      this.selectedFilters = this.router.getCurrentNavigation().extras.state.ids;

    }
  }


  ngOnInit(): void {
    this.tender = [];

    this._tenderService.tenderItemFilterChanged
      .subscribe(tender => { 
          this.tender = Object.assign({}, { ...this.tender, ...tender });          
        const cardID = this.tender?.kanbancard && this.tender?.kanbancard[0]?.id ? this.tender?.kanbancard[0]?.id : 0;
        if (!this.isFirstCallLoaded && !!cardID) {
          this.tender.comments = [];
          this.tender.users = [];
          this.isFirstCallLoaded = true;
          this._scrumboardService.getCard(cardID, { cardAsResponse: true }).toPromise().then((card) => {
            this.tender.comments = Object.values(card.comments);
            this.isTenderStillLoading = false;
          });
          this._scrumboardService.getUsers().toPromise().then((result) => this.tender.users = result.objects)
        }

        this.filtredTender = Object.assign({}, tender);
        if(this.filtredTender?.assets?.length)
          this.assetsDescriptionAttr = getAttributesForAssetsTable(this.tender.assets);
          //this.pricingDescriptionAttr = Object.values(this.tender.pricings).sort((a:any,b:any)=>Object.values(b.results[0]).length - Object.values(a.results[0]).length )[0]['results'][0];
        if(this.filtredTender?.pricings?.length ){
          this.pricingDescriptionAttr = this.filtredTender?.pricings?.length ? getAttributesForPricingTable(this.filtredTender?.pricings) : '';

          this.filtredTender?.pricings && Object.values(this.tender.pricings).map((price: any) => {
           !!price?.sites && price.sites.map((site) => {
            this.tender?.pricing_types && Object.values(this.tender.pricing_types).map((item) => {
               if (!this.filtersList.includes('Site:' + site))
                 this.filtersList.push('Site:' + site);
               else if (!this.filtersList.includes('PricingType:' + item))
                 this.filtersList.push('PricingType:' + item);
 
               else if (!this.filtersList.includes('History'))
                 this.filtersList.push('History');
             });
 
           });
 
           !!price?.results && price.results.map((result) => {
 
             if (this.isPriceResultApproved(result) && this.isCurrentUserTrader)
               this.checkedCheckboxes[String(this.getPriceIdFromPricingResults(result))] = true;
 
           })
 
 
         });
        }
        
        // Apply filter when filters add via state from offer details page , check line 65
        if (this.selectedFilters)
          this.applyTenderFilter();
        
      });
  }
  ngOnDestroy(): void {
    this.destroy.next(true);
  }
  openAddPricingDialog() {
    this.dialog.open(PricingTaskDialogComponent, {
      width: '400px', data: { id: this.tender.id , tender:this.tender }
    });
  }
  openAddPricingObject() {
    this.dialog.open(PricingObjectDialogComponent, {
      width: '700px', data: { tender: this.tender }
    });
  }
  openCommercialPricingDialog(priceID: string, colomnCode: string, isAddForm: boolean = false, data: any = {}) {
    console.log(data);
    let commercialMarginDialog;
    if (isAddForm) {
      commercialMarginDialog = this.dialog.open(CommericialPricingDialogComponent, {
        width: '400px',
        data: {
          id: priceID,
          code: colomnCode
        }
      });
    } else {
      commercialMarginDialog = this.dialog.open(CommericialPricingDialogComponent, {
        width: '400px',
        data: {
          id: priceID,
          content: data
        }
      });
    }

    commercialMarginDialog.afterClosed().subscribe(result => {
      console.log(result);
      this.filtredTender.pricings = this.filtredTender.pricings.map((price) => {
        if (result && price.id == result.pricing_id)
          price.commercial_prices.push(result);
        return price;
      });

    });
  }
  
  openTimeSeriesDialog() {
    this.dialog.open(TimeSeriesDialogComponent, {
      width: '600px', data: { tender: this.tender }
    });
  }

  remove(filter: string): void {
    const index = this.selectedFilters.indexOf(filter);

    if (index >= 0) {
      this.selectedFilters.splice(index, 1);
    }
    this.applyTenderFilter();

  }
  add(event: MatChipInputEvent | string | number): void {
    let value, input;
    if (typeof event == 'string' || typeof event == 'number') {
      input = null;
      value = String(event);
    } else {
      input = event.input;
      value = event.value;
    }

    // Add our filter
    if ((value || '').trim() && !this.selectedFilters.includes(value)) {
      this.selectedFilters.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.filterForm.setValue(null);
    this.applyTenderFilter();
  }
  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedFilters.push(event.option.viewValue);
    this.filterInput.nativeElement.value = '';
    this.filterForm.setValue(null);
    this.applyTenderFilter();
  }
  getValueFromFilter(val: string) {
    return val.split(':')[1]
  }
  isAllPricesChecked(){
    return this.filtredTender.pricings.length == this.checkedCheckboxes.filter((e)=>!!e).length
  }
  
  setAllPricesAsChecked(event:MatCheckboxChange){
  
    this.filtredTender.pricings.map((price: any) => {
       price?.results.map(result=>  this.checkedCheckboxes[String(this.getPriceIdFromPricingResults(result))] = event.checked)
     
    });
  }
  applyTenderFilter() {
    this.filtredTender.pricings = [];
    this.tender?.pricings && Object.values(this.tender.pricings).map((price: any) => {
      if (this.selectedFilters.length) {

        this.selectedFilters.map((filter: string) => {
          // -1 filter based sites , price type , Name
          if ((!this.filtredTender.pricings.includes(price) && price.sites.includes(this.getValueFromFilter(filter)))
            ||
            // if price type filter selected
            (!this.filtredTender.pricings.includes(price) && price.type && price.type.indexOf(this.getValueFromFilter(filter)) > -1)
            // if history selected then add all pricings
            || this.selectedFilters.includes('History')
            // if the price name is identical
            || price.name.includes(filter)
            // if price ID is on the filter
            || Number(price.id) == Number(filter)
          )
            this.filtredTender.pricings.push(price);

          // -2 filter based on results ID  
          Object.values(price.results).map((result) => {
            if (Number(filter) === this.getPriceIdFromPricingResults(result)) {
              this.filtredTender.pricings.push(price);
            }

          });



        })
      } else {
        this.filtredTender.pricings.push(price);
      }


    });

    if (this.selectedFilters.includes('History'))
      this.showFullPricingHistory = true;
    else this.showFullPricingHistory = false;
    console.log(this.filtredTender);
  }

  updateEditPricingTable(columName: string, pricingID: (number | null), event: any): void {

    const newValue = event.target.value;
    const pricings = JSON.parse(JSON.stringify(this.filtredTender.pricings))

    this.filtredTender.pricings = Object.values(pricings).map((price: any) => {

      price.results = price.results.map((result) => {

        result = result.map((item) => {
          const attr = Object.keys(item)[0];
          const val = Object.values(item)[0];

          // Change price if detected
          if (this.getPriceIdFromPricingResults(result) == pricingID && attr == columName) {
            console.log('Price detected , new value is:', { [attr]: newValue })
            return { [attr]: newValue };
          }

          return item;
        });
        // Save new Pricing line in DB
        if (this.getPriceIdFromPricingResults(result) == pricingID) {
          
        const kanbanCardID = this.tender?.kanbancard && this.tender?.kanbancard[0]?.id || null;
        this._scrumboardService.addNewComment({ text: "__PRICING_RESULTS_CHANGED__", kanbancard_id: kanbanCardID }).subscribe((r)=>r);

          this._tenderService.updateTenderPricingResault(pricingID, this.transformUpdatedResultToKeyValue(result, ['id', 'date'])).subscribe();
        }

        return result;

      });



      return price;
    });
    console.log(this.filtredTender);

  }
  /**
  * Get if Current Value has commercial pricing or not
  * @param commercialPricingList 
  * @returns {boolean}
  */
  hasCommercialPrice(commercialPricingList: any) {

    if (commercialPricingList)
      return Object.values(commercialPricingList).length;
    else
      return false;
  }
  /**
  * Get Commercial pricing details
  * @param commercialPricingList 
  * @returns {Array}
  */
  getCommercialPriceDetails(commercialPricingList: any) {
    if (commercialPricingList)
      return commercialPricingList[commercialPricingList.length - 1];
    else
      return [];
  }
  /**
  * generate Hex color randomly
  * @param id 
  * @returns {Array}
  */
  getRandomColor(id: number) {
    return '#' + Math.floor(id * 597 + 100).toString(16);

  }
  /**
  * Focus on results Tab and apply filter by price name
  * @param index 
  * @param name 
  */
  filterTableByPriceName(index: number, name: string) {
    if (!name) return;

    this.selectedTab.setValue(index);
    this.selectedFilters.push(name);
    this.applyTenderFilter();
    this.selectedTabIndexChange(3); 
    console.log(this.filtredTender.pricings)
  }

  /**
  * Callback to tabs index changing event (selectedIndexChange) , and update selectedTab value.
  * @param index 
  
  */
  selectedTabIndexChange(index: number) {
    this.selectedTab.setValue(index);
  }


  changeAssetMarkerIcon(index = null) {
    this.tender.assets = this.tender.assets.map((asset, key) => {
      if (index == key)
        asset['active'] = true;
      else
        asset['active'] = false;

      return asset;
    });
  }
  focusSelectedAsset(index): void {

    document.querySelector('#asset-' + index).scrollIntoView();
    if (this.tender?.assetsLoaded)
      this.changeAssetMarkerIcon(index);
  }

  isAtLeastOneCheckboxChecked(): boolean {
    return !!this.checkedCheckboxes.filter((val) => !!val).length;
  }

  redirectToCreatOffersPage(): void {

    // Getting the selected pricings Ids and send them throught state to offer page.
    this.router.navigateByUrl('/apps/offers/new', {
      state: {
        id: this.tender.id,name:this.tender.name, pricings:
          { ...Object.entries(this.checkedCheckboxes).filter((item) => item[1]).map((item) => Number(item[0])) }
      }
    }
    );
 
  }
  approvePriceByTrader(): void {
    const checkedIds: any[] = [...Object.entries(this.checkedCheckboxes).filter((item) => item[1]).map((item: any) => Number(item[0]))];
    Object.values(this.filtredTender.pricings).map((price: any) => {
      price.results.map((result: any) => {

        result.push({ "APPROVED": checkedIds.includes(this.getPriceIdFromPricingResults(result)) ? true : false });

        this._tenderService.updateTenderPricingResault(this.getPriceIdFromPricingResults(result), this.transformUpdatedResultToKeyValue(result, ['id', 'date', 'CM'])).subscribe((res) => {
          this.checkedCheckboxes = [];
        }
        )

      });
    });
    const kanbanCardID = this.tender?.kanbancard && this.tender?.kanbancard[0]?.id || null;
    this._scrumboardService.addNewComment({ text: "__PRICING_RESULTS_APPROVED_COUNT__/"+checkedIds?.length, kanbancard_id: kanbanCardID }).subscribe((r)=>r);

    this._snackBar.open("Selected pricings approved successfully !", 'dismiss', {
      duration: 3000
    });

  }
  removeTenderDialog(){
      this.dialog.open(RemoveTenderDialogComponent, {
        width: '600px', data: { tender: this.tender }
      });
  }
 

}


