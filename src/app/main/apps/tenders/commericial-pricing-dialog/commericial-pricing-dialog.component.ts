import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TendersService } from "../tenders.service";
@Component({
  selector: 'app-commericial-pricing-dialog',
  templateUrl: './commericial-pricing-dialog.component.html',
  styleUrls: ['./commericial-pricing-dialog.component.scss']
})
export class CommericialPricingDialogComponent implements OnInit {
  commercialPricingForm: FormGroup;

  constructor(private _tenderService: TendersService, public dialogRef: MatDialogRef<CommericialPricingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit(): void {
    this.commercialPricingForm = new FormGroup({
      pricing_code: new FormControl(this.data.code),
      price: new FormControl('', Validators.required),
      comment: new FormControl(''),
      pricing_id: new FormControl(this.data.id),
    });
  }
  submitCommercialPrice() {
    this._tenderService.setNewCommercialPricing(this.commercialPricingForm.value).subscribe();
    this.dialogRef.close(this.commercialPricingForm.value);
  }

}
