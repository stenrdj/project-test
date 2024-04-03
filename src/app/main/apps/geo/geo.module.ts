import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistriesComponent } from './registries/registries.component';
import { DealsComponent } from './deals/deals.component';
import { ReportComponent } from './report/report.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Routes } from '@angular/router';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule } from '@fuse/components';
import { MatButtonModule } from '@angular/material/button';
import { UploadRegistryModalComponent } from './registries/upload-registry-modal/upload-registry-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { GeoService } from './geo.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppDirectivesModule } from '../directives/gepo-directives.module';


const routes: Routes = [
  {
    path:'registries',
    component:RegistriesComponent
  },
  {
    path:'deals',
    component:DealsComponent
  },
  {
    path:'report',
    component:ReportComponent
  }
];

@NgModule({
  declarations: [    
    UploadRegistryModalComponent,
    RegistriesComponent,
    DealsComponent,
    ReportComponent,

  ],
  imports: [
  RouterModule.forChild(routes),   
    FuseSharedModule,
    FuseSidebarModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    DragDropModule,
    MatRadioModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSnackBarModule,
    AppDirectivesModule,
  ],
  providers: [
    GeoService
  ]
  
})
export class GeoModule { }
