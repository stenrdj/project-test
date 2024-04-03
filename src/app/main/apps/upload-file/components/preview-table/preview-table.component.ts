import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-preview-table',
  templateUrl: './preview-table.component.html',
  styleUrls: ['./preview-table.component.scss']
})
export class PreviewTableComponent implements OnChanges {
  @Input() data: any[];
  displayedColumns: string[];
  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data.currentValue != null) {
      this.displayedColumns = [];
      for (const key in changes.data.currentValue[0]) {
        if (Object.prototype.hasOwnProperty.call(changes.data.currentValue[0], key)) {
          this.displayedColumns.push(key);
        }
      }
    }
  }


}
