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

  public formatBytes(bytes, decimals = 2) {
    if (bytes == null) { return '-'; }
    if (bytes === 0) { return '0 Bytes'; }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Apply encodeURIComponent to a filename, escape !, ', and *, then undo some escaping from encodeURIComponent, and return the string.
   * 
   * @param filename The original file name to be encoded
   * @returns The encoded file name
   */
  public encodeFileName(filename: string): string {
    return encodeURIComponent(filename)
    // Escape additional characters not handled by encodeURIComponent
    .replace(/!/g, '%21')   // Encode exclamation mark
    .replace(/'/g, '%27')   // Encode single quote
    .replace(/\*/g, '%2A')  // Encode asterisk

    // Convert certain escaped characters to underscore
    .replace(/%2F/g, '_')  // Replace encoded forward slash with underscore
    .replace(/%5C/g, '_')  // Replace encoded backslash with underscore
    .replace(/%20/g, '_'); // Replace encoded space with underscore
  }
}
