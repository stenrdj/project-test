import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { RegistryFileUploadStatusType, UploadRegistryModalComponent } from './upload-registry-modal/upload-registry-modal.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';
import { GeoService } from '../geo.service';
import { flatten } from 'app/helpers/tenderHelpers';
import { result } from 'lodash';

export interface RegistryType {
  price: number;
  volume: number;
  registry: string;
  productionend: Date|string;
  productionstart: Date|string;
  state:string,
  site:string
}

@Component({
  selector: 'app-registries',
  templateUrl: './registries.component.html',
  styleUrls: ['./registries.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})


export class RegistriesComponent implements OnInit {
  displayedColumns: string[] = ['price','volume','registry','productionend','productionstart','country','site'];
  dataSource :any;
  registriesList:RegistryType[];
  uploadedFileStatus:RegistryFileUploadStatusType;
  constructor(public model: MatDialog,private _GeoService:GeoService) { 
   
  }

  ngOnInit(): void {
    this.loadAllRegistries()
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  openUploadRegistryModal(){
    let dialogRef = this.model.open(UploadRegistryModalComponent, {
      height: '400px',
      width: '600px',
    });
    dialogRef.afterClosed().subscribe((resultsUploaded)=>{
      console.log(resultsUploaded);
        this.uploadedFileStatus = resultsUploaded;
         if(!! this.uploadedFileStatus?.results?.success)
          this.loadAllRegistries()
    })
  }
  
  loadAllRegistries(){
      this._GeoService.getRegistriesList().subscribe((results)=>{
        console.log('list of registries loaded');
        this.registriesList = Object.values(results).map((registry)=>{
          return flatten(registry)
        });
        this.dataSource = new MatTableDataSource(this.registriesList);

    })
  }

}
