import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AgmCoreModule } from '@agm/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TendersListComponent } from './tenders-list/tenders-list.component';
import { TendersDetailsComponent } from './tenders-details/tenders-details.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { TendersService } from './tenders.service';
import { ScrumboardService } from "../scrumboard/scrumboard.service";
import { GoogleMapsModule } from '@angular/google-maps';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components';
import { PricingTaskDialogComponent } from './pricing-task-dialog/pricing-task-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NewTenderComponent } from './new-tender/new-tender.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { EditTenderComponent } from './edit-tender/edit-tender.component';
import { CommericialPricingDialogComponent } from './commericial-pricing-dialog/commericial-pricing-dialog.component';
import { PricingObjectDialogComponent } from './pricing-object-dialog/pricing-object-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TendersAutocompleteComponent } from './tenders-autocomplete/tenders-autocomplete.component';
import { TimeSeriesDialogComponent } from './time-series-dialog/time-series-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { RemoveTenderDialogComponent } from './remove-tender-dialog/remove-tender-dialog.component';
import { AppPipesModule } from 'app/helpers/pipes/gepoPipesModule.module';
import {MatMenuModule} from '@angular/material/menu';
import { AppDirectivesModule } from '../directives/gepo-directives.module';

const routes: Routes = [
    {
        path: 'new',
        component: NewTenderComponent,
    }, {
        path: ':id/edit',
        component: EditTenderComponent,
        resolve: {
            data: TendersService
        }
    },

    {
        path: ':id',
        component: TendersDetailsComponent,
        resolve: {
            data: TendersService
        }
    },
    {
        path: '',
        component: TendersListComponent,
        resolve: {
            data: TendersService
        }
    },
];

@NgModule({
    declarations: [
        TendersListComponent,
        TendersDetailsComponent,
        PricingTaskDialogComponent,
        NewTenderComponent,
        EditTenderComponent,
        CommericialPricingDialogComponent,
        PricingObjectDialogComponent,
        TimeSeriesDialogComponent,
        RemoveTenderDialogComponent,
        TendersAutocompleteComponent,
        
    ],
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
        MatAutocompleteModule,
        MatDatepickerModule,
        GoogleMapsModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatButtonToggleModule,
        MatProgressSpinnerModule,
        MatCardModule,
        AppPipesModule,
        MatMenuModule,
        AppDirectivesModule
    ],
    providers: [TendersService, ScrumboardService]
})
export class TendersModule {
}
