import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';

import { FuseSharedModule } from '@fuse/shared.module';

import { FuseSidebarModule } from '@fuse/components';
import { UploadFileComponent } from './upload-file.component';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PreviewTableComponent } from './components/preview-table/preview-table.component';
import { TemplateConfigurationComponent } from './components/template-configuration/template-configuration.component';
import { MatTableModule } from '@angular/material/table';
import {  MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {UploadFileService } from './upload-file.service'
import { ScrumboardService } from '../scrumboard/scrumboard.service';
import { AgGridModule } from '@ag-grid-community/angular';
import { GridValidationToolTipComponent } from './components/grid-validation-tool-tip/grid-validation-tool-tip.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { GoogleMapsModule } from '@angular/google-maps';
import { AppDirectivesModule } from '../directives/gepo-directives.module';

 const routes = [
    {
        path: 'import',
        component: UploadFileComponent
    }
];

@NgModule({
    declarations: [
        UploadFileComponent,
        PreviewTableComponent,
        TemplateConfigurationComponent,
        GridValidationToolTipComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        MatTableModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatProgressBarModule,
        FuseSharedModule,
        FuseSidebarModule,
        MatStepperModule,
        DragDropModule,
        MatAutocompleteModule,
        MatSnackBarModule,
        MatButtonToggleModule,
        GoogleMapsModule,
        AppDirectivesModule,
        AgGridModule.withComponents([GridValidationToolTipComponent])

    ],
    providers: [
        UploadFileService,ScrumboardService
    ]
})
export class UploadFileModule {
}
