import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { TableParamsObject } from '../components/table-template/table-params-object';
import { Constants } from 'app/shared/utils/constants';

@Injectable()
export class TableTemplateUtils {
  constructor(
    private platformLocation: PlatformLocation,
    private router: Router
  ) { }

  /**
   * Updates the URL params based on the parameters that are given.
   *
   * @param sortString The column to sort by
   * @param currentPage The current page of results
   * @param pageSize How many results are included in one page
   * @param filter Active filters
   * @param keywords The search string entered by the user
   * @param projectTypes The values that are active in the project type filter
   */
  public updateUrl(sortString: string, currentPage: number, pageSize: number, filter = null, keywords = '', projectTypes = '') {
    let currentUrl = this.router.url;
    currentUrl = (this.platformLocation as any).getBaseHrefFromDOM() + currentUrl.slice(1);
    currentUrl = currentUrl.split('?')[0];
    const queryParams: any = {
      currentPage: currentPage,
      pageSize: pageSize,
      keywords: keywords ?? undefined,
      projectTypes: projectTypes ?? undefined,
      sortBy: sortString ?? undefined,
      ms: Date.now()
    };

    if (filter) {
      Object.keys(filter).forEach(key => {
        queryParams[key] = filter[key];
      });
    }

    window.history.replaceState({}, '', currentUrl + '?' + new URLSearchParams(queryParams).toString());
  }


  /**
   * Retrieves the parameters from the URL, optionally modifies filter values in URL.
   *
   * @param params The new parameters that you wish to apply to the TableParamsObject
   * @param filter The filter URL value to add/modify (optional)
   * @param defaultSortBy The default 'sort by' value (optional)
   * @returns A table parameter object
   */
  public getParamsFromUrl(params, filter = null, defaultSortBy = null) {
    let pageSize = params.pageSize || Constants.tableDefaults.DEFAULT_PAGE_SIZE;
    let currentPage = params.currentPage || Constants.tableDefaults.DEFAULT_CURRENT_PAGE;
    let sortBy = params.sortBy ? params.sortBy : (defaultSortBy || Constants.tableDefaults.DEFAULT_SORT_BY);
    let keywords = params.keywords || Constants.tableDefaults.DEFAULT_KEYWORDS;

    this.updateUrl(sortBy, currentPage, pageSize, filter, keywords);

    return new TableParamsObject(
      pageSize,
      currentPage,
      0,
      sortBy,
      keywords
    );
  }

  public updateTableParams(tableParams: TableParamsObject, pageNumber: number, sortBy: string) {
    tableParams.sortBy = sortBy;
    tableParams.currentPage = pageNumber;
    return tableParams;
  }
}
