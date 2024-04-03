import { Component, Inject, OnInit } from '@angular/core';
import { TendersService } from './../tenders.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-remove-tender-dialog',
  templateUrl: './remove-tender-dialog.component.html',
  styleUrls: ['./remove-tender-dialog.component.scss']
})
export class RemoveTenderDialogComponent implements OnInit {

  constructor(public _tenderService:TendersService , public _snackBar:MatSnackBar , public router:Router,public dialogRef: MatDialogRef<RemoveTenderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit(): void {
  }

  removeTender(){
    this._tenderService.removeTender(this.data.tender.id).subscribe(result =>{
      this._snackBar.open("Tender "+this.data.tender.name+" removed successfully !", 'dismiss', {
        duration: 3000
      });
      this.dialogRef.close();
      this.router.navigateByUrl('/apps/tenders');
    });
    

  }
  closeDialog(){
    this.dialogRef.close()
  }  
}
