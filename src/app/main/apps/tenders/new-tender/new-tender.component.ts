import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { catchError, map, startWith, switchMap, mergeMap, concatMap } from 'rxjs/operators';
import { TendersService } from "../tenders.service";
import { ScrumboardService } from "../../scrumboard/scrumboard.service";
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { EMPTY, Observable } from 'rxjs';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment-timezone';;
import { DateAdapter } from '@angular/material/core';
import { Console } from 'console';
import { addWorkingDays } from 'app/helpers/dateHelper';

@Component({
  selector: 'app-new-tender',
  templateUrl: './new-tender.component.html',
  styleUrls: ['./new-tender.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class NewTenderComponent implements OnInit {
  addTenderForm: FormGroup;
  countries: string[] = [];
  regions: string[] = [];
  accoutsList: any;
  opportunitiesList: any;
  nameInputFocused: boolean = false;
  newTendertype: 'geri' | 'new' = 'new';
  constructor(private _tenderService: TendersService, private _router: Router, private _scrumboardService: ScrumboardService, private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {

    this.addTenderForm = new FormGroup({
      name: new FormControl({ value: '', disabled: true }, Validators.required),
      prefix: new FormControl(''),
      description: new FormControl(''),
      accountName: new FormControl(''),
      opportunity: new FormControl(''),
      counterpart: new FormControl('', Validators.required),
      deadline: new FormControl(),
      technology: new FormControl(''),
      country: new FormControl('', Validators.required),
    });

    this._tenderService.getRegionsList().map((item) => {
      this.countries.push(item?.country);
    });
    this.countries = [...new Set(this.countries)];


    // Load Accounts and opportunities
    this.addTenderForm.get('accountName').valueChanges.subscribe((val) => {
      this.addTenderForm.get('opportunity').setValue('');
      if (typeof val == 'string')
        this._tenderService.getAccountsListFromReferential(val).pipe(
          catchError(e => {
            this._snackBar.open('An issue accured while connecting to GemForce , please skip this field for now !.', null, {
              duration: 3000,
              panelClass: ['yellow-700-bg', 'fuse-black-fg']
            })
            return EMPTY
          })
        ).subscribe((res) =>
          this.accoutsList = res.accountResults
        );
      if (typeof val == 'object') {
        console.log('now show opportunities for account ID:', val.accountId);
        this._tenderService.getOpportunitiesFromGemForce(val.accountId).pipe(
          catchError(e => {
            this._snackBar.open('An issue accured while connecting to GemForce , please skip this field for now !.', null, {
              duration: 3000,
              panelClass: ['yellow-700-bg', 'fuse-black-fg']
            })
            return EMPTY
          })
        ).subscribe((opp) =>
          this.opportunitiesList = opp
        )
      }

    });
    
    this.addTenderForm.valueChanges.subscribe((vals) => {
      if (this.addTenderForm.get('name').value == vals.counterpart + '_' + vals.prefix + '_' +addWorkingDays( moment(vals.deadline),3).format('YYYY-MM-DD') ||
        this.addTenderForm.get('name').value == vals.counterpart + '_' +addWorkingDays( moment(vals.deadline),3).format('YYYY-MM-DD')) return;
      if (this.newTendertype == 'geri') return;

      if (vals.counterpart && vals.deadline) {
        if (vals.prefix)
          this.addTenderForm.get('name').setValue(vals.counterpart + '_' + vals.prefix + '_' +addWorkingDays( moment(vals.deadline),3).format('YYYY-MM-DD'));
        else
          this.addTenderForm.get('name').setValue(vals.counterpart + '_' +addWorkingDays( moment(vals.deadline),3).format('YYYY-MM-DD'));


      }


    }
    );


  }
  changeTenderType(type: 'geri' | 'new') {
    this.newTendertype = type;
    if (type == 'geri') {

      this.addTenderForm.get('name').enable();
      this.addTenderForm.get('name').setValue('');
      this.addTenderForm.get('counterpart').clearValidators();
      this.addTenderForm.get('counterpart').updateValueAndValidity();
      this.addTenderForm.get('country').clearValidators();
      this.addTenderForm.get('country').updateValueAndValidity();
    }
    if (type == 'new') {
      this.applyDefaultValuesForNameField();
      this.addTenderForm.get('name').disable();
      this.addTenderForm.get('counterpart').setValidators([Validators.required]);
      this.addTenderForm.get('country').setValidators([Validators.required]);
    }
  }
  applyDefaultValuesForNameField() {
    if(!this.addTenderForm.get('name').value || !this.addTenderForm.get('deadline').value)
      return;
    if (this.addTenderForm.get('prefix').value)
      this.addTenderForm.get('name').setValue(this.addTenderForm.get('counterpart').value + '_' + this.addTenderForm.get('prefix').value + '_' + addWorkingDays( moment(this.addTenderForm.get('deadline').value),3).format('YYYY-MM-DD'));
    else
      this.addTenderForm.get('name').setValue(this.addTenderForm.get('counterpart').value + '_' + addWorkingDays( moment(this.addTenderForm.get('deadline').value),3).format('YYYY-MM-DD'));

  }
  submitTender() {
    if (this.addTenderForm.valid) {
      let dataBody;
   

       dataBody = {
        name: this.addTenderForm.get('name').value,
        description: this.addTenderForm.get('description').value || "",
        targeted_capacity: 0,
        counterpart: this.addTenderForm.get('counterpart').value || null,
        deadline: (this.addTenderForm.get('deadline').value && this.addTenderForm.get('deadline').value.tz("Europe/Berlin").add(3,'days').format('MM/DD/YYYY')) || null,
        technology: this.addTenderForm.get('technology').value || null,
        region: null,
        country: this.addTenderForm.get('country').value || null,
      };
      if(this.newTendertype == 'geri')
          /* This is just dumb data , it will be overided in the server by data from GERI */
          dataBody = {
          name: this.addTenderForm.get('name').value,
          counterpart: "GERI",
          deadline: "2021-10-30T18:00:00.000Z",
          technology: "ONSHORE_WIND",
          country:"FR",
        };

      /**
      * Create the tender and associated card for Kanban Board
      *
      **/


      this._tenderService.setNewTender(dataBody).pipe(
        catchError(err => {
          this._snackBar.open('An error has been occurred while creating Tender , please correct / complete your field entries.', 'dismiss', {
            duration: 3000
          });
          return EMPTY;
        }),
        mergeMap((tenderResult)=>{
          return  this._scrumboardService.addCard({ name: tenderResult.name, kanbanlist_id: 1, kanbanboard_id: 1, tender_id: tenderResult.id ,sort_order:0})
        }),
        mergeMap(cardResults=>{
          console.log(cardResults);
           return this._scrumboardService.addNewComment({text: "__TENDER_CREATED__",kanbancard_id: cardResults.id}) 
        })
      ).subscribe((result) => {
        console.log(result);
        this._snackBar.open('Tender created successfully!', 'dismiss', {
          duration: 3000
        }); 
        // Redirect to import assets with prefilled tender
        this._router.navigateByUrl('/apps/data/import', {
          state: {
            tender:result,
            id: result?.kanbancard?.tender_id,
            name: result?.kanbancard?.name,
            kanbancardId: result?.kanbancard?.id
          }
        }
        );

      })


    }
  }

}
