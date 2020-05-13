import { Pipe, PipeTransform } from '@angular/core';
import { Utils } from 'app/shared/utils/utils';

@Pipe({
  name: 'numToWord'
})
export class NumberToWordPipe implements PipeTransform {

  constructor(public utils: Utils) {}
  // Outpus numbers 0 through 20 as word equivalent
  // Otherwise, returns original int
  transform(num: number): string | number {
    return this.utils.numToWord(num)
  }
}
