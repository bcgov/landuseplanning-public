import { Pipe, PipeTransform } from '@angular/core';

//
// Filter to handle JSON->HTML newlines.
//
@Pipe({
  name: 'newline'
})
export class NewlinePipe implements PipeTransform {

  transform(value: any): any {
    let input = value || '';
    return input.replace(/\\n/g, '<br />');
  }

}
