import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TendersService } from '../../tenders/tenders.service'
import * as moment from 'moment-timezone';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { getPriceDateDifference } from "../../../../helpers/dateHelper";
import { fuseAnimations } from '@fuse/animations';
import { filterPricingResultsByIds, getAllResultsIdsFromPrice, getAllResultsPricingIdsFromPricings, getAttributesForPricingTable, getPriceIdFromPricingResults, isPriceResultApproved } from 'app/helpers/tenderHelpers';
import { commercialMarginFormulas, fixedPricesFormulas, getPriceCalculated, isAttributeFromTheFormulat } from '../../../../helpers/pricingFormulas';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY } from 'rxjs';
import { catchError, map, tap, filter } from 'rxjs/operators';
import { ScrumboardService } from '../../scrumboard/scrumboard.service';
@Component({
  selector: 'app-create-new-offer',
  templateUrl: './create-new-offer.component.html',
  styleUrls: ['./create-new-offer.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class CreateNewOfferComponent implements OnInit, AfterViewInit {

  @ViewChild('stepper') private stepper: MatStepper;
  @ViewChild('generatedTable', { read: ElementRef }) generatedTable: ElementRef;


  objectKeys = Object.keys;
  Number = window.Number;
  moment: any = moment;
  isLinear = true;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  tendersList: any = [];
  isLoading: boolean = true;
  selectedPricingResultsIds: any = [];
  editedPricingTable: any = [];
  tenderPricingList: any = [];
  paramsFromTenderResults: any;
  tenderId: number;
  tenderName: string;
  kanbanCardID:number;
  colomnSelected: string;
  generateClassicTable: boolean = false;
  isFixedPricingFormulasSelected: boolean = false;
  isCMFormulatSelected: boolean = false;
  isEditAllPricingFomulaSelected: boolean = false;
  checkedPricingIdsForFormulats: number[] = [];
  fixedPricesFormulas = fixedPricesFormulas;
  commercialMarginFormulas = commercialMarginFormulas;
  formulasList: any[] = [];
  formulasInputValues: number[] = [];
  console = window.console;
  getPriceDateDifference = getPriceDateDifference;
  isPriceResultApproved = isPriceResultApproved;
  getPriceIdFromPricingResults = getPriceIdFromPricingResults;
  filterPricingResultsByIds = filterPricingResultsByIds;
  getAllResultsIdsFromPrice = getAllResultsIdsFromPrice;
  getAllResultsPricingIdsFromPricings = getAllResultsPricingIdsFromPricings;
  isAttributeFromTheFormulat = isAttributeFromTheFormulat;
  getPriceCalculated = getPriceCalculated;
  constructor(private _formBuilder: FormBuilder, private _tenderService: TendersService, private router: Router, private _snackBar: MatSnackBar,private _scrumboardService:ScrumboardService) {
     this._tenderService.getTendersList().subscribe((list) => {
      this.tendersList = list;
      this.isLoading = false;

    });
    // If we got data from Tenders pricing results , then we will skep first step of offers.
    // the param containe the tender id and ids of selected pricings.
    if (this.router.getCurrentNavigation().extras.state) {

      this.isLinear = false;
      const tenderId = this.router.getCurrentNavigation().extras.state.id;
      const tenderPricingsIds = this.router.getCurrentNavigation().extras.state.pricings;
      this.tenderName = this.router.getCurrentNavigation().extras.state.name;
      this.tenderId = tenderId;
      this.selectedPricingResultsIds = Object.values(tenderPricingsIds);
      console.log('Create offer from Tender pricings');
      console.log(this.selectedPricingResultsIds);
      this.isLinear = true;
    }

  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.selectedPricingResultsIds.length && this.tenderId) {
        this.firstFormGroup.get('selectedTender').setValue({id:this.tenderId,name:this.tenderName});
        this.isLinear = false;
        this.stepper.next();
        this.isLinear = true;
      }
    }, 0);


  }

  ngOnInit() { 
    this.firstFormGroup = this._formBuilder.group({
      selectedTender: ['', Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['']
    });
    this.firstFormGroup.get('selectedTender').valueChanges.subscribe((val) => {
      //this.selectedPricingResultsIds = [];
      if (typeof val == 'object'){
        this._tenderService.tenderItemFilterChanged.next([]);
        this.isLoading = true;
         this.firstFormGroup.get('selectedTender').setValue(val.name);
        this.loadTenderDetails(val.id);
      }
        
    });

  }

  loadTenderDetails(id: number): void {
    console.log("Start loading tender details");
    this.isLoading = true;
    this.tenderId = id;
    this._tenderService.getTenderItemFull(id, { loadAssets: false, LoadTasks: false }).pipe(
      catchError(err => {
        this._snackBar.open('An error has been occurred , can\'t load tender details ! please try again.', null, {
          duration: 3000
        });
        return EMPTY;
      }),
     ).subscribe();

    this._tenderService.tenderItemFilterChanged
    .pipe(
      catchError(err => {
        this.isLoading = false;
        this._snackBar.open('An error has been occurred , can\'t load tender details ! please try again.', null, {
          duration: 3000
        });
        return EMPTY;
      }))
      .subscribe((tender: any) => {
          const _tender = JSON.parse(JSON.stringify(tender));
         // Remove any reference inside the object by stringifyinh it and parse it again  
         this.kanbanCardID = _tender?.kanbancard && _tender?.kanbancard[0]?.id || null;
        if (_tender?.pricings) {
          this.tenderPricingList['prices'] = _tender.pricings?.filter((price)=> price?.results?.filter((result)=>this.isPriceResultApproved(result)).length);
          if(!this.tenderPricingList?.attr?.length){
            this.tenderPricingList['attr'] = _tender.pricings?.length ? getAttributesForPricingTable(_tender.pricings) : '';
            this.editedPricingTable['attr'] = this.tenderPricingList['attr'];
          }
            
          this.editedPricingTable['prices'] = this.selectedPricingResultsIds.length ? this.filterPricingResultsByIds(this.tenderPricingList['prices'], this.selectedPricingResultsIds) : [];
          this.isLoading = false;
        }
        
        //console.log(this.editedPricingTable.prices);

      })
  }

  addRemovePrice(price: any, resultID: number): void {
    price = JSON.parse(JSON.stringify(price));
    if (this.selectedPricingResultsIds.includes(resultID)) {
      console.log('ID Already existe => so lets delete it from the selected list');
      this.selectedPricingResultsIds = this.selectedPricingResultsIds.filter((id) => id != resultID);


      this.editedPricingTable['prices'] = this.editedPricingTable['prices'].filter((_price) => _price.id != price.id);
    } else {
      this.selectedPricingResultsIds.push(resultID);
      //Check if the resultID already add in previous pricings
      if (!this.getAllResultsPricingIdsFromPricings(this.editedPricingTable['prices']).includes(price.id))
        this.editedPricingTable['prices'].push(price);
    }

    console.log('All price results ID:', this.getAllResultsIdsFromPrice(price));
    console.log('selected results ids', this.selectedPricingResultsIds);
    console.log(this.editedPricingTable['prices']);

  }


  updateEditPricingTable(columName: string, pricingID: (number | null | 'all'), event: any = null): void {
    const columnIndex = this.editedPricingTable['attr'].indexOf(columName);
    console.log(columnIndex);

    const newValue = !!event && !!event?.target ? event.target.value : event;

    this.editedPricingTable.prices = this.editedPricingTable['prices'].map((price) => {

      price.results = price.results.map((result) => {

        result = result.map((item, rIndex) => {
          const attr = Object.keys(item)[0];
          const val = Object.values(item)[0];
          // calculated price brick
          if (attr == 'Price')
            item.Price = this.getPriceCalculated(result, this.isCMFormulatSelected ? 'CM' : 'fixedPrice');

          // is pricingID is all , then its for all pricings
          if (pricingID == 'all' && attr == columName) {
            return { [attr]: newValue };
          }

          // is pricingID is null , then its the title of column and not pricing value
          if (pricingID == null && attr == columName) {
            this.editedPricingTable['attr'][columnIndex] = newValue;
            return { [newValue]: val };
          }

          // Change price if detected
          if (attr == columName && pricingID != null && (price.id == pricingID || this.getPriceIdFromPricingResults(result) == pricingID)) {
            return { [attr]: newValue };
          }


          return item;
        });
        // is pricingID is null , then its new colomn to add
        if (pricingID == null && columnIndex < 0 && (this.isFixedPricingFormulasSelected == true || this.isCMFormulatSelected == true) && !!columName) {
          if (!this.editedPricingTable['attr'].includes(columName))
            this.editedPricingTable['attr'].push(columName);
          result.push({ [columName]: '0' });
        }

        return result;

      });





      return price;
    });
    console.warn(this.editedPricingTable.prices);

  }

  removePricingColomn(colomnName: string): void {
    const colomnIndex = this.editedPricingTable['attr'].indexOf(colomnName);
    console.log('Attributes', this.editedPricingTable.attr);
    console.log('colomnIndex', colomnIndex);

    this.editedPricingTable['attr'] = this.editedPricingTable.attr.filter((elem) => elem != colomnName);

    this.editedPricingTable['prices'] = this.editedPricingTable['prices'].map((price) => {

      price.results = price.results.map((result) => {

        result = result.filter((item) => {
          const attr = Object.keys(item)[0];
          const val = Object.values(item)[0];
          if (attr == colomnName) {
            console.log(colomnName + ' Removed from the price');
            return false; // remove column from price result

          }
          return true;
        });
        return result;
      });

      return price;
    });

    console.log('this.editedPricingTable.attr', this.editedPricingTable.attr);
    console.log('this.tenderPricingList.attr', this.tenderPricingList.attr);
    console.log('this.editedPricingTable.prices', this.editedPricingTable['prices'])
  }
  /**
   * Generate Offer table result and create the offer on the server
   * @return {void}
   */

  generateTablePricings(): void {
    this.isLoading = true; 
    this._tenderService.createNewTenderOffer({ "tender_id": Number(this.tenderId), "status": "offered", 'is_type_classic': this.generateClassicTable, "pricings": this.editedPricingTable.prices }).subscribe((result) =>{
       this.isLoading = false;
       this._scrumboardService.addNewComment({text: "__OFFER_CREATED__",kanbancard_id: this.kanbanCardID}).subscribe(); 
    }
      
    );
  }

  /**
   * Copy the HTML of generated table to clipboard
   * @return {void}
   */
  copyGeneratedTable(): void {

    let range = document.createRange();
    range.selectNode(this.generatedTable.nativeElement);
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().empty();
  }

  addFixedPricingFormulas() {
    this.isFixedPricingFormulasSelected = true;
    if (this.isEditAllPricingFomulaSelected) return;
    this.fixedPricesFormulas.map((formulat) => this.updateEditPricingTable(formulat.attr, null, null));
    this.formulasList = this.fixedPricesFormulas;
    this.updateEditPricingTable('Price', null, null);
  }
  addCMFormulas() {
    this.isCMFormulatSelected = true;
    if (this.isEditAllPricingFomulaSelected) return;
    this.commercialMarginFormulas.map((formulat) => this.updateEditPricingTable(formulat.attr, null, null));
    this.formulasList = this.commercialMarginFormulas;
    this.updateEditPricingTable('Price', null, null);

  }
  applyFormulatForSelectedResults(attr) {
    const selectedCheckboxIds = Object.values(this.checkedPricingIdsForFormulats.map((elm, key) => elm ? key : null).filter(elm => elm));
    const attrValue = this.formulasInputValues[attr];
    //run twice because of results update first time doesnt get correct values for calculation
    //@TO IMPROVE
    selectedCheckboxIds.map((priceID) => this.updateEditPricingTable(attr, priceID, attrValue));
    selectedCheckboxIds.map((priceID) => this.updateEditPricingTable(attr, priceID, attrValue));

  }
  applyFormulatForAllTableResults(attr) {
    const attrValue = this.formulasInputValues[attr];
    //run twice because of results update first time doesnt get correct values for calculation
    //@TO IMPROVE
    this.updateEditPricingTable(attr, 'all', attrValue);
    this.updateEditPricingTable(attr, 'all', attrValue);

  }
  getPriceSitesAsString = (sites) => sites.reduce((resulte, item) => resulte + ',' + item);

  isColumnNameNotInTheFomulas(colName) {
    return !this.formulasList.filter((formulat) => formulat.attr == colName).length;
  }
}
