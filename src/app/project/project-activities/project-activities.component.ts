import { Component, OnInit, ChangeDetectorRef, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { Subject } from 'rxjs';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { News } from 'app/models/news';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { SearchTerms } from 'app/models/search';
import { ActivitiesListTableRowsComponent } from './activities-list-table-rows/activities-list-table-rows.component';

@Component({
  selector: 'app-project-activities',
  templateUrl: './project-activities.component.html',
  styleUrls: ['./project-activities.component.scss']
})
export class ProjectActivitiesComponent implements OnInit, OnDestroy {
  @Input() project;
  @Input() activities;

  public terms = new SearchTerms();
  public recentActivities: Array<News> = [];
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public tableParams: TableParamsObject = new TableParamsObject();
  public loading = true;
  public currentProject;

  public tableData: TableObject;
  public tableColumns: any[] = [
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
  constructor(private router: Router,
    private route: ActivatedRoute,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef) { }

  ngOnInit() {
    if (this.activities?.[0]?.data?.meta?.length > 0) {
      this.tableParams.totalListItems = this.activities[0].data.meta[0].searchResultsTotal;
      this.recentActivities = this.activities[0].data.searchResults;
    } else {
      this.tableParams.totalListItems = 0;
      this.recentActivities = [];
    }

    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
        if (this.tableParams.sortBy === '-datePosted') {
          this.tableParams.sortBy = '-dateAdded';
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
        }
        this.setRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  setRowData() {
    let list = [];
    if (this.recentActivities && this.recentActivities.length > 0) {
      this.recentActivities.forEach(document => {
        list.push(
          document
        );
      });
      this.tableData = new TableObject(
        ActivitiesListTableRowsComponent,
        list,
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
    this.getPaginatedDocs(this.tableParams.currentPage);
  }

  getPaginatedDocs(pageNumber) {
    // Go to top of page after clicking to a different page.
    // window.scrollTo(0, 0);

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = pageNumber;
    params['sortBy'] = this.tableParams.sortBy = '-dateAdded';
    params['keywords'] = this.tableParams.keywords;
    params['pageSize'] = this.tableParams.pageSize = 10;
    if (this.project?._id) {
      this.router.navigate(['p', this.project._id, 'project-details', params]);
    }
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
    if (this.project?._id) {
      this.router.navigate(['p', this.project._id, 'project-details', params]);
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
