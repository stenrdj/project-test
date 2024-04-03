import { Component, Inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AnySrvRecord } from "dns";
import { exit } from "process";
import { GeoService } from "./../../geo.service";

export interface RegistryFileUploadStatusType {
  file:File,
  results:{
    success:String[],
    errors:String[]
  }
}

@Component({
  selector: 'app-upload-registry-modal',
  templateUrl: './upload-registry-modal.component.html',
  styleUrls: ['./upload-registry-modal.component.scss']
})
export class UploadRegistryModalComponent implements OnInit {
  selectedFile: File;
  isFileDragged: Boolean;
  uploading: boolean;
  errorMessage: string;
  fileForm: FormGroup; 
  constructor(
    public dialogRef: MatDialogRef<UploadRegistryModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    private geoService: GeoService,
    private _snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.fileForm =
      this.fb.group({
        file: new FormControl("", [Validators.required]),
        country: new FormControl("", [Validators.required]),
      },);
  }
  onFileChanged(event) {
    this.isFileDragged = false;
    this.selectedFile = event.target.files[0];
    this.fileForm.get("file").setValue(this.selectedFile);
  }
  dragFile(draggedFiles) {
    this.isFileDragged = true;
    this.selectedFile = draggedFiles[0];
    this.fileForm.get("file").setValue(this.selectedFile);
  }
  startUploadRegistry() {
    if (this.fileForm.valid) {
      const formdata = new FormData();
      formdata.append("file", this.fileForm.get("file").value);
      formdata.append("country", this.fileForm.get("country").value);

      
      this.geoService.uploadRegistryFile(formdata).subscribe((result:any) => {
        console.log(result,typeof result);
          let fileStatus:RegistryFileUploadStatusType ={'file':this.fileForm.get('file').value,'results':{ 'success':[],'errors':[]}} ;
      

        if (!result.length) {
          fileStatus.results.success.push(result);
          this._snackBar.open(
            "Registry file is uploading ... ",
            "dismiss",
            {
              duration: 3000,
            },
          );
         
        }

        if (result?.length) {
           // if its a json , then the results are succefuly added or there is same existing data
          fileStatus.results.errors = result;
        }
        this.dialogRef.close(fileStatus);
      },);
    }
  }
}
