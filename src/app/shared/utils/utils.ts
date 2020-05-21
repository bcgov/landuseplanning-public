import { Injectable } from '@angular/core';

@Injectable()
export class Utils {
  constructor() { }

  public numToWord(num) {
    const wordArray = [
      'zero', 'one', 'two', 'three', 'four', 'five',
      'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
      'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'
    ]
    if (typeof wordArray[num] === 'undefined') {
      return num;
    } else {
      return wordArray[num];
    }
  }


}
