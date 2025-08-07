import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScriptLoaderService {
  private loadedScripts: { [url: string]: boolean } = {};
  private loadedStyles: { [url: string]: boolean } = {};

  /**
   * Load a single script
   * 
   * @param path The location of the script that you would like to load
   * @returns Promise<void>
   */
  loadScript(path: string): Promise<void> {
    if (this.loadedScripts[path]) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${path}"]`)) {
        this.loadedScripts[path] = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = path;
      script.async = true;

      script.onload = () => {
        this.loadedScripts[path] = true;
        resolve();
      };

      script.onerror = () => reject(new Error(`Failed to load script: ${path}`));

      document.body.appendChild(script);
    });
  }

  /**
   * Load a single stylesheet
   * 
   * @param url The location of the stylesheet that you would like to load
   * @returns Promise<void>
   */
  loadStyle(url: string): Promise<void> {
    if (this.loadedStyles[url]) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[href="${url}"]`)) {
        this.loadedStyles[url] = true;
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;

      link.onload = () => {
        this.loadedStyles[url] = true;
        resolve();
      };

      link.onerror = () => reject(new Error(`Failed to load style: ${url}`));

      document.head.appendChild(link);
    });
  }

  /**
   * Load multiple scripts
   * 
   * @param paths The locations of the scripts that you would like to load
   * @returns Promise<void>
   */
  loadScripts(paths: string[]): Promise<void[]> {
    return Promise.all(paths.map(path => this.loadScript(path)));
  }

  /**
   * Load multiple stylesheets
   * 
   * @param urls The locations of the stylesheets that you would like to load
   * @returns Promise<void>
   */
  loadStyles(urls: string[]): Promise<void[]> {
    return Promise.all(urls.map(url => this.loadStyle(url)));
  }
}