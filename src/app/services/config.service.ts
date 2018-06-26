import { Injectable } from '@angular/core';

//
// This service/class provides a centralized place to store some values
// that multiple components might want access to.
//

@Injectable()
export class ConfigService {

  // defaults
  private _isApplistListVisible = true;
  private _isApplistFiltersVisible = false;

  constructor() { }

  // called by app constructor
  public init() {
    // FUTURE: load setting from window.localStorage?
  }

  // called by app constructor - for future use
  public destroy() {
    // FUTURE: save settings to window.localStorage?
  }

  get isApplistListVisible(): boolean { return this._isApplistListVisible; }
  set isApplistListVisible(val: boolean) { this._isApplistListVisible = val; }

  get isApplistFiltersVisible(): boolean { return this._isApplistFiltersVisible; }
  set isApplistFiltersVisible(val: boolean) { this._isApplistFiltersVisible = val; }

}
