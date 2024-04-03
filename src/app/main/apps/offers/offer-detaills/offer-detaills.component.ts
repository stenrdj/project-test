import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TendersService } from '../../tenders/tenders.service';
import * as moment from 'moment-timezone';
import { fuseAnimations } from '@fuse/animations';
import { getPriceDateDifference } from "../../../../helpers/dateHelper";
import { getAllResultsPricingIdsFromPricings, getAttributesForPricingTable } from '../../../../helpers/tenderHelpers'
import { Router } from '@angular/router';
import { getPriceCalculated } from 'app/helpers/pricingFormulas';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScrumboardService } from '../../scrumboard/scrumboard.service';

@Component({
  selector: 'app-offer-detaills',
  templateUrl: './offer-detaills.component.html',
  styleUrls: ['./offer-detaills.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class OfferDetaillsComponent implements OnInit {
  tender: any = null;
  moment: any = moment;
  getAttributesForPricingTable: any = getAttributesForPricingTable;
  getPriceDateDifference: any = getPriceDateDifference;
  getAllResultsPricingIdsFromPricings: any = getAllResultsPricingIdsFromPricings;
  getPriceCalculated: any = getPriceCalculated;

  constructor(private _tenderService: TendersService, private router: Router, private _snackBar: MatSnackBar,private _scrumboardService:ScrumboardService) { }

  ngOnInit(): void {
    this._tenderService.tenderItemFilterChanged.subscribe((tender: any) => {
      console.log(tender);
      if(!this.tender){
        this.tender = tender;
      }
    })
  }

  routeToOriginalPrices(id, pricings) {
    let ids = [];
    ids.push(...this.getAllResultsPricingIdsFromPricings(pricings, false))
    this.router.navigateByUrl('apps/tenders/' + id, {
      state: {
        ids: ids.map((id) => String(id))
      }
    });


  }


  getPriceSitesAsString = (sites) => sites.reduce((resulte, item) => resulte + ',' + item);

  deleteOffer(offerId: number) {
    this._tenderService.deleteTenderOffer(offerId).subscribe((result) =>{
      this._snackBar.open("Offer deleted successfully !", 'dismiss', {
        duration: 3000
      });
      this._scrumboardService.addNewComment({text: "__OFFER_DELETED__",kanbancard_id: this.tender?.kanbancard[0]?.id}).subscribe(); 

    }
      
    )
  }

}
