import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateNewOfferComponent } from './create-new-offer/create-new-offer.component';
import { RouterModule, Routes } from '@angular/router';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

import { TendersService } from '../tenders/tenders.service';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { OffersListComponent } from './offers-list/offers-list.component';
import { OfferDetaillsComponent } from './offer-detaills/offer-detaills.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ScrumboardService } from '../scrumboard/scrumboard.service';
import { AppPipesModule } from 'app/helpers/pipes/gepoPipesModule.module';

const routes:Routes = [
  {
    path:'new',
    component:CreateNewOfferComponent
  },
    {
      path:'all',
      component:OffersListComponent,
      resolve  : {
        data :TendersService
     } 
  },
  {
    path:':id',
    component:OfferDetaillsComponent,
    resolve  : {
      data :TendersService
   } 
}
];

@NgModule({
  declarations: [ CreateNewOfferComponent, OffersListComponent, OfferDetaillsComponent],
  imports: [
  RouterModule.forChild(routes),
    MatIconModule,
        MatButtonModule,
        MatChipsModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        MatRippleModule,
        MatSelectModule,
        MatSortModule,
        MatSnackBarModule,
        MatTableModule,
        MatTabsModule,
        NgxChartsModule,
        FuseSharedModule,
        FuseWidgetModule,
        MatDividerModule,
        MatDialogModule,
        MatListModule,
        ReactiveFormsModule,
        MatAutocompleteModule ,
        MatDatepickerModule,
        MatStepperModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatCardModule,
        MatCheckboxModule,
        AppPipesModule
   ],
  providers   : [ TendersService,ScrumboardService]
})
export class OffersModule { }
