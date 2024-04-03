import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, skipWhile, switchMap, filter } from 'rxjs/operators';
import { TendersService } from '../tenders.service';
import { ScrumboardService } from './../../scrumboard/scrumboard.service';

@Component({
  selector: 'app-time-series-dialog',
  templateUrl: './time-series-dialog.component.html',
  styleUrls: ['./time-series-dialog.component.scss']
})
export class TimeSeriesDialogComponent implements OnInit {
  isFileDragged: boolean;
  selectedFile: any;
  uploading: boolean;
  uploadWithSuccess: boolean;
  errorMessage: any;
  fileForm: FormGroup;
  showUpload:boolean= false;
  filesList:string[];
  filesListFiltred:string[];
  selectedFilter:string = null;

  constructor(private fb: FormBuilder,public _snackbar: MatSnackBar ,public _tenderService : TendersService ,public dialogRef: MatDialogRef<TimeSeriesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,private _scrumboardService:ScrumboardService
) { }

  ngOnInit(): void {
    this.fileForm = this.fb.group({
      'file': new FormControl('', Validators.required),
      'uploadType': new FormControl('', Validators.required),
      'assetId': new FormControl(''),
      'siteId': new FormControl(''),
    });

    this._tenderService.listTimeSeriesFiles().subscribe((result:any)=>{
      this.filesList = result.objects.filter(file=>file.tender_id == this.data.tender.id);
      this.filesListFiltred = this.filesList;
      console.log(this.filesList );
    });
    
  }
  onFileChanged(event) {
    this.isFileDragged = false;
    this.selectedFile = event.target.files[0]; 
    console.log(event.target.files[0]);
     this.fileForm.get('file').setValue(this.selectedFile)
  }
  dragFile(draggedFiles) {
    this.isFileDragged = true;
    this.selectedFile = draggedFiles[0];
    this.fileForm.get('file').setValue(this.selectedFile)
   }
  upload() {
      if (!this.fileForm.valid) return;
    this.uploading = true;
    const file = {
      file: this.selectedFile ,
      filename: this.selectedFile.name,
      tender_id:  this.data.tender.id ,
      site_id:  this.isTypeSelected('site') ? this.fileForm.get('siteId').value?.id : '',
      asset_id: this.isTypeSelected('asset') ? this.fileForm.get('assetId').value?.id : ''

    }
    this._tenderService.setTimeSeriesFile(file).pipe(
      skipWhile((res:any) => res.progress < 100),
    ).subscribe(res => {
        const kanbanCardId = this.data.tender?.kanbancard[0]?.id;
        this._scrumboardService.addNewComment({text: "__TIMESERIE_FILE_UPLOADED__",kanbancard_id: kanbanCardId}).subscribe(); 
        console.log(res);
        this.uploading = false;
        if (!!res?.response?.message) {
          this.uploadWithSuccess = false;
          this.errorMessage = res?.response?.message

        } else {
          this.uploadWithSuccess = true;
          this.errorMessage = null;
          this._snackbar.open('Timeseries uploaded succefully!', null, {
            duration: 3000
          });
          this.showUpload = false;
        }

    }); 
  }
  
  /**
   * Get if type selected
   * 
   * @param  {string} name
   */
  isTypeSelected(name:string){
    return this.fileForm.get('uploadType').value.includes(name)
  }

  applyFilter(name:string){
    this.selectedFilter =  this.selectedFilter == name ? null : name;
    this.filesListFiltred = this.filesList?.filter((file:any)=> this.selectedFilter ? (file?.asset?.name == this.selectedFilter || file?.site?.name == this.selectedFilter) : true );

  }


}
