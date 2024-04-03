import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { TendersService } from '../tenders.service';
import * as moment from 'moment-timezone';;
import { map, startWith, switchMap, take } from 'rxjs/operators';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import { DateAdapter } from '@angular/material/core';
import { ScrumboardService } from 'app/main/apps/scrumboard/scrumboard.service';
@Component({
  selector: 'app-edit-tender',
  templateUrl: './edit-tender.component.html',
  styleUrls: ['./edit-tender.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class EditTenderComponent implements OnInit {
  tender: any = {};
  addTenderForm: FormGroup;
  countries: string[] = [];
  regions: string[] = [];
  moment: any = moment;
  accoutsList: any;
  opportunitiesList: any;


  constructor(public _tenderService: TendersService, private _router: Router , private _scrumboardService : ScrumboardService) { }

  ngOnInit(): void {
    this._tenderService.tenderItemFilterChanged.pipe(take(1))
      .subscribe(tender => {
        this.tender = Object.assign({}, tender);
      });
    this.addTenderForm = new FormGroup({
      name: new FormControl(this.tender.name, Validators.required),
      description: new FormControl(this.tender.description.length ? this.tender.description : ""),
      counterpart: new FormControl(this.tender.counterpart),
      deadline: new FormControl(this.moment(this.tender.deadline).tz("Europe/Berlin").toISOString()),
      technology: new FormControl(this.tender.technology),
      country: new FormControl(this.tender.country, Validators.required),
      accountName: new FormControl(''),
      opportunity: new FormControl(''),
      status: new FormControl(this.tender.status, Validators.required),
    });

    this._tenderService.getRegionsList().map((item) => {
      this.countries.push(item?.country);
      this.regions.push(item?.name);
    });

    this.countries = [...new Set(this.countries)];

    // Load Accounts and opportunities
    this.addTenderForm.get('accountName').valueChanges.subscribe((val) => {
      this.addTenderForm.get('opportunity').setValue('');
      if (typeof val == 'string')
        this._tenderService.getAccountsListFromReferential(val).subscribe((res) =>
          this.accoutsList = res.accountResults
        );
      if (typeof val == 'object') {
        console.log('now show opportunities for account ID:', val.accountId);
        this._tenderService.getOpportunitiesFromGemForce(val.accountId).subscribe((opp) =>
          this.opportunitiesList = opp
        );
      }

    });

  }

  submitTender() {
    if (this.addTenderForm.valid) {
      const dataBody = {
        name: this.addTenderForm.get('name').value,
        description: this.addTenderForm.get('description').value || "",
        counterpart: this.addTenderForm.get('counterpart').value || null,
        deadline: (this.addTenderForm.get('deadline').value && this.moment(this.addTenderForm.get('deadline').value).tz("Europe/Berlin").add(3,'days').toISOString()) || null,
        technology: this.addTenderForm.get('technology').value,
        country: this.addTenderForm.get('country').value || null,
        status: this.addTenderForm.get('status').value || null,
        id: Number(this.tender.id)
      };

      this._tenderService.updateTender(dataBody).pipe(
        switchMap((result) =>
          this._router.navigate(['/apps/tenders/' + result.id])
        )).subscribe((result)=>{
          console.log("tender updated");
          console.log(this.addTenderForm.get('status').value,this.tender.status , this.addTenderForm.get('status').value != this.tender.status);
          const kanbanCardId = this.tender?.kanbancard[0]?.id;
          // Status Changed
            if(this.addTenderForm.get('status').value != this.tender.status)
                this._scrumboardService.addNewComment({text: "__TENDER_STATUS_CHANGED_FROM__/"+this.tender.status+"/_TO_/"+this.addTenderForm.get('status').value,kanbancard_id: kanbanCardId}).subscribe();
            // Technology Changed
            if(this.addTenderForm.get('technology').value != this.tender.technology)
                this._scrumboardService.addNewComment({text: "__TENDER_TECHNOLOGY_CHANGED_FROM__/"+this.tender.technology+"/_TO_/"+this.addTenderForm.get('technology').value,kanbancard_id: kanbanCardId}).subscribe(); 
            // Deadline Changed
            if(this.moment(this.addTenderForm.get('deadline').value).tz("Europe/Berlin").format('DD/MM/YYYY') != this.moment(this.tender.deadline).tz("Europe/Berlin").format('DD/MM/YYYY'))
                this._scrumboardService.addNewComment({text: "__TENDER_DEADLINE_CHANGED_FROM__/"+this.moment(this.tender.deadline).tz("Europe/Berlin").format('DD/MM/YYYY').toISOString()+"/_TO_/"+this.moment(this.addTenderForm.get('deadline').value).tz("Europe/Berlin").format('DD/MM/YYYY').toISOString(),kanbancard_id: kanbanCardId}).subscribe();
            // Name Changed
            if(this.addTenderForm.get('name').value != this.tender.name)
                this._scrumboardService.addNewComment({text: "__TENDER_NAME_CHANGED_FROM__/"+this.tender.name+"/_TO_/"+this.addTenderForm.get('name').value,kanbancard_id: kanbanCardId}).subscribe(); 
            // Country Changed
            if(this.addTenderForm.get('country').value != this.tender.country)
                this._scrumboardService.addNewComment({text: "__TENDER_COUNTRY_CHANGED_FROM__/"+this.tender.country+"/_TO_/"+this.addTenderForm.get('country').value,kanbancard_id: kanbanCardId}).subscribe(); 
            // Description Changed
            if(this.addTenderForm.get('description').value != this.tender.description && this.tender.description.length)
                this._scrumboardService.addNewComment({text: "__TENDER_DESCRIPTION_CHANGED_FROM__/"+this.tender.description+"/_TO_/"+this.addTenderForm.get('description').value,kanbancard_id: kanbanCardId}).subscribe(); 
        

        });
    }
  }


}


