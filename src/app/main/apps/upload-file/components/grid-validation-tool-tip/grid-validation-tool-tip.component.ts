import { Component } from '@angular/core';
import { ITooltipParams } from '@ag-grid-community/core';
import { ITooltipAngularComp } from '@ag-grid-community/angular';

@Component({
  selector: 'app-grid-validation-tool-tip',
  template: ` <div class="custom-tooltip"  [class]="data?.class" *ngIf="data?.value">
  <p>  {{data?.value }} </p> 
</div>`,
styles: [
  `
    :host {
      position: absolute;
      height: 70px;
      pointer-events: none;
      transition: opacity 1s;
    }

    :host.ag-tooltip-hiding {
      opacity: 0;
    }

    .custom-tooltip p {
      padding: 5px; 
    }

    .custom-tooltip p:first-of-type {
      font-weight: bold;
    }
  `,
],
})
export class GridValidationToolTipComponent implements ITooltipAngularComp  {

  private params: { value: string ,class:string} & ITooltipParams;
  public data: any; 

  agInit(params: { value: string ,class:string} & ITooltipParams): void {
    this.params = params;
        
    this.data = this.params.value;
     
  }

}
