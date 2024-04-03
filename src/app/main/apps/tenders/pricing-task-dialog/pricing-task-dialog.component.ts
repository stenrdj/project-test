import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TendersService } from '../tenders.service';
import { ScrumboardService } from 'app/main/apps/scrumboard/scrumboard.service';
@Component({
  selector: 'app-pricing-task-dialog',
  templateUrl: './pricing-task-dialog.component.html',
  styleUrls: ['./pricing-task-dialog.component.scss']
})
export class PricingTaskDialogComponent implements OnInit {
  pricingTaskForm: any;
  constructor(public _tenderService: TendersService, public dialogRef: MatDialogRef<PricingTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,private _scrumboardService:ScrumboardService

  ) { }

  ngOnInit(): void {
    this.pricingTaskForm = new FormGroup({
      store: new FormControl(true, Validators.required),
      use_subside: new FormControl(true, Validators.required),
      year_window_len: new FormControl(3, Validators.required),
      reuse_computed_proxy: new FormControl(true, Validators.required),
      estimator_order: new FormControl('', Validators.required),
      tender_id: new FormControl(this.data.id),
    });
    console.log(this.data?.tender?.kanbancard[0]?.id);

  }
  createPricingTask() {
    console.log(this.pricingTaskForm.value);
    this._tenderService.getTenderPricingTask(this.pricingTaskForm.value).subscribe();
    const kanbanCardId = this.data?.tender?.kanbancard[0]?.id;
    this._scrumboardService.addNewComment({text: "__PRICING_TASK_CREATED__",kanbancard_id: kanbanCardId}).subscribe(); 
    this.dialogRef.close();
  }


}
