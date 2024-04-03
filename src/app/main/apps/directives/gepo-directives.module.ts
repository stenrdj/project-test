import { NgModule } from '@angular/core';
import { FileDragDropDirective } from './file-drag-drop.directive';



@NgModule({
  exports: [FileDragDropDirective],
  declarations: [
    FileDragDropDirective
  ]
})
export class AppDirectivesModule { }
