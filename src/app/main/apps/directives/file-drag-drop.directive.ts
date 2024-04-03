import { Directive, ElementRef, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appFileDragDrop]'
})
export class FileDragDropDirective {

  @Output() onFileDropped = new EventEmitter<any>();
	
   @HostBinding('style.opacity') private opacity = '1';
   @HostBinding('style.transform') private transform = 'unset';
   //Dragover listener
  @HostListener('dragover', ['$event']) onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
     this.opacity = '0.8'
     this.transform = 'scale(1.02)';
  }
	
  //Dragleave listener
  @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
     this.opacity = '1'
     this.transform = 'unset';
  }
	
  //Drop listener
  @HostListener('drop', ['$event']) public ondrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
     this.opacity = '1';
 
    let files = evt.dataTransfer.files;
     if (files.length > 0) {
      this.onFileDropped.emit(files)
    }
  }
   

}
