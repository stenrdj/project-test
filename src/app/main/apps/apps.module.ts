import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {FuseSharedModule} from '@fuse/shared.module'; 

const routes = [
    {
        path: 'scrumboard',
        loadChildren: () => import('./scrumboard/scrumboard.module').then(m => m.ScrumboardModule)
    },
    {
        path: 'data',
        loadChildren: () => import('./upload-file/upload-file.module').then(m => m.UploadFileModule)
    },
    {
        path: 'tenders',
        loadChildren: () => import('./tenders/tenders.module').then(m => m.TendersModule)
    },
    {
        path: 'offers',
        loadChildren: () => import('./offers/offers.module').then(m => m.OffersModule)
    },
    {
        path: 'geo',
        loadChildren: () => import('./geo/geo.module').then(m => m.GeoModule)
    }
];

@NgModule({
    imports: [
    RouterModule.forChild(routes),
        FuseSharedModule
    ],
})
export class AppsModule {
}
