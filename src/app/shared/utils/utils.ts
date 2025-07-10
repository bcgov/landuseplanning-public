import { Injectable } from '@angular/core';
import { Project } from 'app/models/project';

export type ConnectionTier = 'slow' | 'medium' | 'fast' | 'turbo';

// As defined in MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation
export interface NetworkInformation extends EventTarget {
  downlink: number;
  downlinkMax?: number; // Deprecated edge case
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  rtt: number;
  saveData: boolean;
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
  onchange?: () => void;
}

export interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

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

  /**
   * Returns an estimated connection tier based on downlink.
   * If downlink can't be found, it falls back to small image load time.
   * 
   * @returns {Promise<ConnectionTier>}
   */
  public async getConnectionTier(): Promise<ConnectionTier> {
    // Try to retrieve the connection speed directly
    const conn = (navigator as NavigatorWithConnection).connection || (navigator as NavigatorWithConnection).mozConnection || (navigator as NavigatorWithConnection).webkitConnection;

    if (conn?.downlink) {
      const speed = conn.downlink;
      if (speed < 1) return 'slow';
      else if (speed < 10) return 'medium';
      else if (speed < 100) return 'fast';
      else return 'turbo';
    }

    // Image load time fallback
    return new Promise<ConnectionTier>((resolve) => {
      const img = new Image();
      const start = performance.now();

      img.onload = () => {
        const duration = performance.now() - start;
        if (duration > 50) return resolve('slow');
        else return resolve('medium');
      };

      img.onerror = () => resolve('medium'); // assume average
      img.src = 'https://www.google.com/images/phd/px.gif?' + Date.now();
    });
  }

  /**
     * Make sure the project marker is valid and within BC bounds
     * 
     * @param project The project that contains the marker values
     * @returns {boolean}
     */
    public markerMeetsConditions(project: Project): boolean {
      if (!Array.isArray(project.centroid)) return false;
      if (project.centroid.length !== 2) return false;
      const [lon, lat] = project.centroid;
      if (isNaN(lat) || isNaN(lon)) return false;
      if (lat < 48 || lat > 62) return false;
      if (lon < -139 || lon > -114) return false;
      return true;
    }
}
