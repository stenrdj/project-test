import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { colsFromFileType } from './../../upload-file.component';
@Component({
  selector: 'app-template-configuration',
  templateUrl: './template-configuration.component.html',
  styleUrls: ['./template-configuration.component.scss']
})
export class TemplateConfigurationComponent implements OnInit {
  @Input() colsFromFile: colsFromFileType;
  @Input() colsFromPreview: string[];
  @Input() target: string[];
  @Input() colsFromFileNotMapped: string[];
  constructor() { }

  ngOnInit(): void {
  }
   drop(event: CdkDragDrop<string[]>): void {
    console.log( event.previousIndex,
      event.previousContainer.data[event.previousIndex],
      event.currentIndex,
      event.container.data[event.currentIndex]);
      console.log( event.previousIndex,
        event.previousContainer.data[event.currentIndex],
        event.currentIndex,
        event.container.data[event.previousIndex]);

      if( event.previousContainer.data[event.previousIndex] == "__disabled__" || event.container.data[event.currentIndex] == "__disabled__") 
        return;
        
      
      if(event.previousContainer.data == event.container.data){
        console.log('drag and drop in the same column');
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        moveItemInArray(event.container.data,  (event.currentIndex < event.previousIndex ? event.currentIndex+1 :event.currentIndex-1 ), event.previousIndex);  
    } else { 
      console.log('drag and drop between both columns');
      
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
          transferArrayItem(event.container.data,
            event.previousContainer.data,
            event.currentIndex+1,
            event.previousIndex
            );
       
    }
  }
  getPreviewDataOfColName(colName:string):string{
    const colIndex = this.colsFromFile.raw.indexOf(colName);
    if( !this.colsFromPreview?.length ||  colIndex < 0 || String(this.colsFromPreview[colIndex]).trim().length < 1)  return "";
    return `(${this.colsFromPreview[colIndex]})`
  }
}
