import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs/internal/Observable';
import { map, startWith, takeUntil, distinctUntilChanged, concatAll } from 'rxjs/operators';
import { CommericialPricingDialogComponent } from '../commericial-pricing-dialog/commericial-pricing-dialog.component';
import { TendersService } from '../tenders.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as Moment from "moment-timezone";
import { combineLatest, concat, forkJoin, Subject } from 'rxjs';
import { ScrumboardService } from 'app/main/apps/scrumboard/scrumboard.service';

@Component({
  selector: 'app-pricing-object-dialog',
  templateUrl: './pricing-object-dialog.component.html',
  styleUrls: ['./pricing-object-dialog.component.scss']
})
export class PricingObjectDialogComponent implements OnInit, OnDestroy {

  pricingObjectForm: FormGroup;
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filtredSites: Observable<string[]>;
  sites: string[] = [];
  allSites: string[] = [];
  allPeriodes: string[] = ['date'];
  showMatrixTable: boolean = false;
  pricingTypeList: string[] = [];
  isRequestPortfolio: boolean = true;
  combinationList: generatedResultData[] = [];
  moment = Moment;
  isLoading: boolean = false;
  destroy = new Subject();
  numberOfSuccesRequests:any  = 0;

  @ViewChild('siteInput') siteInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;


  constructor(private _tenderService: TendersService,
    public dialogRef: MatDialogRef<CommericialPricingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data, private _snackBar: MatSnackBar,private _scrumboardService : ScrumboardService) {

     /*
     Remove comment if you want that only sites from pricings that shows up.
     --------
     if (data.tender?.pricings?.length)
      data.tender?.pricings?.map((price) => this.allSites.push(...price.sites));
    else
    --------
    */
     data.tender?.sites?.map((site) => site?.name ? this.allSites.push(site.name) : this.allSites.push(site));


    this._tenderService.getPricingTasksAndRisksList().map((item) => {
      this.pricingTypeList.push(item.pricing_type);
    });
    this.allSites = [...new Set(this.allSites)];
    console.log(this.allSites);
    this.pricingTypeList = [...new Set(this.pricingTypeList)].sort((a,b):any=> a.localeCompare(b)  );

  }

  ngOnInit(): void {
    const year = new Date().getFullYear();
    this.pricingObjectForm = new FormGroup({
      site: new FormControl(''),
      pricingType: new FormControl('', Validators.required),
      date: new FormGroup({
        start: new FormControl(new Date(year + 1, 0, 1)),
        end: new FormControl(new Date(new Date(year + 1, 0, 1).setFullYear(new Date().getFullYear() + 2)))
      })

    });
    [2, 3].map(x => this.addNewDateField(x));

    this.filtredSites = this.pricingObjectForm.get("site").valueChanges.pipe(
      startWith(null),
      map((site: string | null) => this.allSites.filter((item) => !!site ? !this.sites.includes(item) && item.toLocaleLowerCase().includes(site.toLocaleLowerCase()) : !this.sites.includes(item))));
  }
  ngOnDestroy(): void {
    this.destroy.next(true);
  }
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if (input.name == 'site' && !this.allSites.includes(value)) return;
    // Add site
    if ((value || '').trim() && input.name == 'site') {
      this.sites.push(value.trim());
    }


    // Reset the input value
    if (input) {
      input.value = '';
    }
    if (input.name == 'site')
      this.pricingObjectForm.get("site").setValue(null);

  }

  remove(value: string, from: string): void {

    if (from == 'site') {
      const index = this.sites.indexOf(value);

      if (index >= 0) {
        this.sites.splice(index, 1);
      }
    }

  }

  selected(event: MatAutocompleteSelectedEvent, from): void {

    if (from == 'site') {
      this.sites.push(event.option.viewValue);
      this.siteInput.nativeElement.value = '';
      this.pricingObjectForm.get("site").setValue(null);
    }


  }
  numberOfCombinationsSelected(){
    return this.combinationList.filter((result) => {
 
      return result.isChecked;
    }).length
  }
  selectAllCombinationList(status:boolean=true){
    this.combinationList = this.combinationList.map((result) => {
      result.isChecked=status;
      return result;
    })
  }
  initiatCreation(isRequestPortfolio: boolean) {
    this.isRequestPortfolio = isRequestPortfolio;
    this.combinationList = this.getParamsCombinations();
    if (this.combinationList.length > 30 && !this.showMatrixTable) {
      this.showMatrixTable = true;
      this.dialogRef.updateSize("700px", "")
    } else
      this.createPricingObject();
  }
  createPricingObject() {
    this.isLoading = true;
    const request$ = [];
    this.combinationList.map((result) => {
      if (!this.showMatrixTable || this.showMatrixTable && result?.isChecked) {
        const body = {
          "sites": result.site,
          "pricing_type": result.pricingType,
          "start_date": result.start,
          "end_date": result.end,
        };
        request$.push(this._tenderService.createNewPricingObject(body, this.data.tender.id).pipe(
          takeUntil(this.destroy)
        ));
      }
    })

    concat(request$).pipe(
      concatAll(),
      distinctUntilChanged(),
      takeUntil(this.destroy)
    ).subscribe(res => {
       console.log(res);
      this.numberOfSuccesRequests += 1;
      const totalNumberOfRequests = this.showMatrixTable ? this.numberOfCombinationsSelected(): this.combinationList?.length;
      if (this.numberOfSuccesRequests ===totalNumberOfRequests) {
        this.isLoading = false;
        this._snackBar.open(this.combinationList?.length + ' Pricing request launched successfully', 'dismiss', {
          duration: 3000
        });
        const kanbanCardId = this.data.tender?.kanbancard[0]?.id;
        this._scrumboardService.addNewComment({text: "__PRICING_OBJECT_CREATED__",kanbancard_id: kanbanCardId}).subscribe(); 
        this.dialogRef.close();
      }
    });
   }
  addAllSitesToList() {
    this.sites = this.allSites;
  }
  addNewDateField(deltaYear: number = 1) {
    deltaYear = deltaYear + 1;
    const year = new Date().getFullYear();
    const dateName = 'date' + Math.random();
    this.allPeriodes.push(dateName);

    this.pricingObjectForm = new FormGroup({
      ...this.pricingObjectForm.controls,
      [dateName]: new FormGroup({
        start: new FormControl(new Date(year + 1, 0, 1)),
        end: new FormControl(new Date(new Date(year, 0, 1).setFullYear(new Date().getFullYear() + deltaYear)))
      })
    });

    console.log(this.pricingObjectForm.value)
  }
  removeDateField(name) {
    this.allPeriodes = this.allPeriodes.filter((elem) => !elem.includes(name));
    this.pricingObjectForm.removeControl(name);

  }
  getParamsCombinations(): generatedResultData[] {
    let results: generatedResultData[] = [];
    const sites = this.sites;
    const dates = this.allPeriodes;
    const pricingTypes = this.pricingObjectForm.get('pricingType').value;
    console.log('isRequestPortfolio :' + this.isRequestPortfolio);
    if (this.isRequestPortfolio) {

      pricingTypes.map((pt) => {

        dates.map((date) => {
          let data = {
            'site': sites,
            'start': this.pricingObjectForm.get([date, 'start']).value,
            'end': this.pricingObjectForm.get([date, 'end']).value,
            'pricingType': pt
          }
          results.push(data);
        })
      })

    } else {
      sites.map((site) => {

        pricingTypes.map((pt) => {

          dates.map((date) => {
            let data = {
              'site': [site],
              'start': this.pricingObjectForm.get([date, 'start']).value.toISOString(),
              'end': this.pricingObjectForm.get([date, 'end']).value.toISOString(),
              'pricingType': pt
            }
            results.push(data);
          })
        })


      })
    }

    console.log(results);
    return results;
  }

}

type generatedResultData = {
  site: string[],
  start: string,
  end: string,
  pricingType: string
  isChecked?: boolean
}
