import { NgModule } from '@angular/core';
import { KwToMwPipe } from 'app/helpers/pipes/kw-to-mw.pipe';

@NgModule({
    imports: [
  // dep modules
    ],
    declarations: [ 
      KwToMwPipe
    ],
    exports: [
        KwToMwPipe
    ]
  })
  export class AppPipesModule {}