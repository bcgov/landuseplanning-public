import { Injectable } from '@angular/core';

//
// This service/class provides a centralized place to persist config values
// (eg, to share values between multiple components).
//

@Injectable()
export class ConfigService {

  // defaults
  private _isApplicationsListVisible = false;
  private _isExploreAppsVisible = false;
  private _isFindAppsVisible = false;
  private _isApplicationsMapVisible = true;
  private _isSidePanelVisible = false;
  private _isAppDetailsVisible = false;
  private _listPageSize = 10;

  // TODO: store these in URL instead
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

  get isApplicationsListVisible(): boolean { return this._isApplicationsListVisible; }
  set isApplicationsListVisible(val: boolean) { this._isApplicationsListVisible = val; }

  get isApplicationsMapVisible(): boolean { return this._isApplicationsMapVisible; }
  set isApplicationsMapVisible(val: boolean) { this._isApplicationsMapVisible = val; }

  // applications page side panel visiblity
  get isSidePanelVisible(): boolean { return this._isSidePanelVisible; }
  set isSidePanelVisible(val: boolean) { this._isSidePanelVisible = val; }

  // applications page details panel visibility
  get isAppDetailsVisible(): boolean { return this._isAppDetailsVisible; }
  set isAppDetailsVisible(val: boolean) { this._isAppDetailsVisible = val; }

  // applications page explore interface
  get isExploreAppsVisible(): boolean { return this._isExploreAppsVisible; }
  set isExploreAppsVisible(val: boolean) { this._isExploreAppsVisible = val; }

      // applications page find interface
  get isFindAppsVisible(): boolean { return this._isFindAppsVisible; }
  set isFindAppsVisible(val: boolean) { this._isFindAppsVisible = val; }

  get listPageSize(): number { return this._listPageSize; }
  set listPageSize(val: number) { this._listPageSize = val; }

  get baseLayerName(): string { return this._baseLayerName; }
  set baseLayerName(val: string) { this._baseLayerName = val; }

}
