import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import 'rxjs/add/operator/takeUntil';

import { News } from 'app/models/news';
import { SearchTerms } from 'app/models/search';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

import { NewsListTableRowsComponent } from './news-list-table-rows/news-list-table-rows.component';

import { SearchService } from 'app/services/search.service';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})

export class NewsListComponent implements OnInit, OnDestroy {
  public recentActivities: Array<News> = [];
  public initialLoadComplete = false;
  public loading = true;
  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  private snackBarCounter = 0;

  public showOnlyOpenApps: boolean;
  public tableParams: TableParamsObject = new TableParamsObject();
  public terms = new SearchTerms();
  public submittedKeywords = '';

  public projectTableData: TableObject;
  public projectTableColumns: any[] = [
    {
      name: 'Headline',
      value: 'headine',
      width: 'col-10',
      nosort: true
    },
    {
      name: 'Date',
      value: 'dateAdded',
      width: 'col-2',
      nosort: true
    }
  ];

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tableTemplateUtils: TableTemplateUtils,
    private searchService: SearchService,
    private _changeDetectionRef: ChangeDetectorRef,
    public snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (!res.activities?.[0]?.data) {
          alert('Uh-oh, couldn\'t load topics');
          this.router.navigate(['/']);
          return;
        }

        if (!this.initialLoadComplete) {
          this.recentActivities = res.activities[0].data.searchResults || [];
          this.tableParams.totalListItems =
            res.activities[0].data.meta?.[0]?.searchResultsTotal || 0;

          this.setRowData();
          this.initialLoadComplete = true;
          this._changeDetectionRef.detectChanges();
        }
      });

    this.route.queryParams
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);

        // Normalize legacy values
        if (this.tableParams.sortBy === '-datePosted') {
          this.tableParams.sortBy = '-dateAdded';
          this.tableTemplateUtils.updateUrl(
            this.tableParams.sortBy,
            this.tableParams.currentPage,
            this.tableParams.pageSize,
            null,
            this.tableParams.keywords
          );
          return;
        }

        this.runSearch();
      });
  }

  private runSearch(): void {
    this.loading = true;

    this.searchService.getSearchResults(
      this.tableParams.keywords,
      'RecentActivity',
      null,
      this.tableParams.currentPage,
      this.tableParams.pageSize,
      this.tableParams.sortBy,
      {},
      true
    )
    .takeUntil(this.ngUnsubscribe)
    .subscribe((res: any) => {
      const data = res?.[0]?.data;
      const resultsCount = data?.meta?.[0]?.searchResultsTotal;
      this.submittedKeywords = this.tableParams.keywords;
      if (data) {
        if (resultsCount) {
          this.tableParams.totalListItems =
          res[0].data.meta[0].searchResultsTotal;
        }

        this.recentActivities = res[0].data.searchResults;
        this.setRowData();
      } else {
        this.recentActivities = [];
        this.tableParams.totalListItems = 0;
      }
      this.loading = false;
      this._changeDetectionRef.detectChanges();

      // Don't show snackbar on initial component load
      if (this.snackBarCounter >= 1) {
        this.snackBarRef = this.snackBar.open(`Recent activities and updates have been updated with ${resultsCount || 0} result${resultsCount !== 1 ? 's' : ''}.`);
        this.snackBarRef._dismissAfter(3000);
      } else {
        this.snackBarCounter++;
      }
    });
  }

  setRowData() {
    if (this.recentActivities && this.recentActivities.length > 0) {
      this.projectTableData = new TableObject(
        NewsListTableRowsComponent,
        this.recentActivities,
        this.tableParams
      );
    }
  }


  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedProjects(this.tableParams.currentPage);
  }

  getPaginatedProjects(pageNumber: number) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams.sortBy = '-dateAdded';
    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);
    this.tableParams.sortBy = '-dateAdded';

    this.searchService.getSearchResults(
      this.tableParams.keywords,
      'RecentActivity',
      null,
      pageNumber,
      this.tableParams.pageSize,
      this.tableParams.sortBy,
      {},
      true
    )
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res[0]?.data) {
          this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
          this.recentActivities = res[0].data.searchResults;
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
          this.setRowData();
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        } else {
          alert('Uh-oh, couldn\'t load topics');
          // activity not found --> navigate back to search
          this.router.navigate(['/']);
        }
      });
  }

  public onSubmit() {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = 1;
    params['sortBy'] = this.tableParams.sortBy = '-dateAdded';
    params['keywords'] = this.tableParams.keywords;
    params['pageSize'] = this.tableParams.pageSize = 10;
    this.router.navigate([], { relativeTo: this.route, queryParams: params });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
