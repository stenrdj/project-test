import { Pipe, PipeTransform } from '@angular/core';
import { isNull, isUndefined } from 'lodash';

@Pipe({
  name: 'kwToMw'
})
export class KwToMwPipe implements PipeTransform {

  transform(value: string | number): string {
    if(isNull(value) || isUndefined(value))
      return '-';
    return (Math.round(Number(value) /100)/10 ).toString()+"Mw";
  }

}
