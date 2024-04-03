import { Component, OnInit, ViewEncapsulation,ViewChild,AfterViewInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';
import { GeoService } from '../geo.service';
import { flatten } from 'app/helpers/tenderHelpers';
import { formatDate } from 'app/helpers/dateHelper';
import { MatPaginator,PageEvent } from '@angular/material/paginator';

interface DealsType {
  price: number;
  volume: number;
  registry: string;
  productionend: Date|string;
  productionstart: Date|string;
  state:string,
  site:string
}

@Component({
  selector: 'app-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})



export class DealsComponent implements OnInit,AfterViewInit  {
  displayedColumns: string[] = ['assetname','applicationperiod','buysell','technology','tradername','counterpartycode','location','portfolioname','deliverydate','enddate','granularity','installedcapacity'];
  dataSource :any;
  dealsList:DealsType[];
  formatDate=formatDate
   @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public model: MatDialog,private _GeoService:GeoService) { 
   
  }
 

  ngOnInit(): void {
    this.loadAllDeals();
    
  }
  ngAfterViewInit() {
    
  }
    
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  } 
  
  loadAllDeals(){
      this._GeoService.getDealsList().subscribe((results)=>{
        console.log('list of registries loaded');
        this.dealsList = Object.values(results).map((registry)=>{
          return flatten(registry)
        });
        console.log(this.dealsList);
        this.dataSource = new MatTableDataSource(this.dealsList);
        this.dataSource.paginator = this.paginator;


    })
  }

}
