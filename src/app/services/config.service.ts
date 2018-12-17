import { Injectable } from '@angular/core';

//
// This service/class provides a centralized place to persist config values
// (eg, to share values between multiple components).
//

@Injectable()
export class ConfigService {

  private _showSplashModal = true;
  private _baseLayerName = 'World Topographic'; // NB: must match a valid base layer name

  constructor() { }

  // called by app constructor
  public init() {
    // FUTURE: load settings from window.localStorage ?
  }

  // called by app constructor - for future use
  public destroy() {
    // FUTURE: save settings to window.localStorage ?
  }

  get showSplashModal(): boolean { return this._showSplashModal; }
  set showSplashModal(val: boolean) { this._showSplashModal = val; }

  get baseLayerName(): string { return this._baseLayerName; }
  set baseLayerName(val: string) { this._baseLayerName = val; }

}
