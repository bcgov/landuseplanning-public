import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subject } from 'rxjs';
import 'rxjs/add/operator/takeUntil';

import * as moment from 'moment';
import * as _ from 'lodash';

import { Project, ProjectType } from 'app/models/project';
import { SearchTerms } from 'app/models/search';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

import { ProjectListTableRowsComponent } from './project-list-table-rows/project-list-table-rows.component';

import { SearchService } from 'app/services/search.service';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { UpdateMatchingData } from '../project-list-filters/project-list-filters.component';
import { Constants } from 'app/shared/utils/constants';

class ProjectFilterObject {
  constructor(
    public agreements: object = {},
    public engagementStatus: object = {},
    public decisionDateStart: object = {},
    public decisionDateEnd: object = {},
    public pcp: object = {},
    public region: Array<string> = [],
    public existingLandUsePlans: Array<string> = [],
    public vc: Array<object> = []
  ) { }
}

interface TableParams {
  pageSize: number;
  currentPage: number;
  totalListItems: number;
  sortBy: string;
  keywords: string;
  projectTypes: string;
}

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})

export class ProjectListComponent implements OnInit, OnDestroy {
  constructor(
    public snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private tableTemplateUtils: TableTemplateUtils,
    private searchService: SearchService,
  ) { }

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;

  public projects: Array<Project> = [];
  public tableParams: TableParams;
  public terms = new SearchTerms();
  public filterForURL: object = {};
  public filterForAPI: object = {};
  public filterForUI: ProjectFilterObject = new ProjectFilterObject();
  public showAdvancedSearch: boolean = true;
  public filterApps: Array<Project> = [];
  public filterCount: number = 0;
  public listApps: Array<Project> = [];
  public snackBarCounter: number = 0;
  public projectTableData: TableObject;

  public showFilters: object = {
    agreements: false,
    engagementStatus: false,
    pcp: false,
    more: false
  };

  public numFilters: object = {
    agreements: 0,
    engagementStatus: 0,
    pcp: 0,
    more: 0
  };
  
  public projectTableColumns: any[] = [
    {
      name: 'Name',
      value: 'name',
      width: 'col-4'
    },
    {
      name: 'Partner First Nation(s)',
      value: 'partner',
      width: 'col-4'
    },
    {
      name: 'Project Type(s)',
      value: 'projectTypes',
      width: 'col-4'
    }
  ];

  // Get the params and save them to this.tableParams. Get the projects and save them to this.projects.
  ngOnInit() {
    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        this.tableParams = this.defineParams(params);
        this.searchService.getSearchResults(
          this.tableParams.keywords,
          'Project',
          [],
          1,
          100,
          this.tableParams.sortBy,
          {},
          true,
          null,
          this.filterForAPI)
          .takeUntil(this.ngUnsubscribe)
          .subscribe((res: any) => {
            console.log('Res', res);
            if (res?.[0]?.data) {
              if (res[0].data.searchResults?.length > 0) {
                this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
                this.projects = this.filterApps = res[0].data.searchResults;
              } else {
                this.tableParams.totalListItems = 0;
                this.projects = this.filterApps = [];
              }
              this.setTableData();
            } else {
              alert('Uh-oh, couldn\'t load search results');
              // results not found --> navigate back to search
              this.router.navigate(['/']);
            }
          });
      });
  }

  /**
   * Defines the parameters by getting existing values or reverting to defaults when necessary.
   * 
   * @param params The router Params object from which we are getting values.
   * @returns The defined TableParams that will be fed to the table.
   */
  public defineParams(params: Params): TableParams {
    return {
      pageSize: params.pageSize || Constants.tableDefaults.DEFAULT_PAGE_SIZE,
      currentPage: params.currentPage || Constants.tableDefaults.DEFAULT_CURRENT_PAGE,
      sortBy: params.sortBy || '+name',
      keywords: params.keywords || Constants.tableDefaults.DEFAULT_KEYWORDS,
      projectTypes: params.projectTypes || Constants.tableDefaults.DEFAULT_PROJECT_TYPES,
      totalListItems: params.totalListItems || 0,
    };
  }

  /**
   * Event handler called when filters component updates list of matching apps.
   * 
   * @param data The data passed from the child filter component to the parent component on filter update.
   */
  public updateMatching(data: UpdateMatchingData) {
    this.projects = this.filterApps.filter(a => a.isMatches);
    this.tableParams.totalListItems = this.projects.length;
    // If filters have been modified, add/modify data to tableParams so it can endure page refresh.
    if (Array.isArray(data.activeFilters)) {
      if (data.activeFilters.length === 3) {
        this.tableParams.projectTypes = 'all';
      } else if (data.activeFilters.length > 0) {
        this.tableParams.projectTypes = data.activeFilters.join(',');
      } else {
        this.tableParams.projectTypes = 'none';
      }
    }
    this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, this.filterForURL, this.tableParams.keywords, this.tableParams.projectTypes)
    this.sortProjects();
    this.setTableData();
    // Don't run the snackbar on page load.
    if (this.snackBarCounter >= 3) {
      this.snackBarRef = this.snackBar.open(`The ${data?.source || 'search or filter'} has been updated with ${this.projects.length} result${this.projects.length === 1 ? '' : 's'}.`);
      this.snackBarRef._dismissAfter(3000);
    } else {
      this.snackBarCounter++;
    }
  }

  collectionFilterToParams(params, name, identifyBy) {
    if (this.filterForUI[name].length) {
      const values = this.filterForUI[name].map(record => { return record[identifyBy]; });
      params[name] = values.join(',');
    }
  }

  isNGBDate(date) {
    return date && date.year && date.month && date.day;
  }

  dateFilterToParams(params, name) {
    if (this.isNGBDate(this.filterForUI[name])) {
      const date = new Date(this.filterForUI[name].year, this.filterForUI[name].month - 1, this.filterForUI[name].day);
      params[name] = moment(date).format('YYYY-MM-DD');
    }
  }

  isShowingFilter() {
    return Object.keys(this.showFilters).some(key => { return this.showFilters[key]; });
  }

  stringifyOverlappingDistricts(districts: string | string[]): string {
    let overlappingDistrictsListString: string;
    if (Array.isArray(districts) === true ) {
      overlappingDistrictsListString = (<string[]>districts).join(', ');
    } else {
      overlappingDistrictsListString = districts as string;
    }
    return overlappingDistrictsListString;
  }

  /**
   * Stringifies the project types for printing in the rows.
   * 
   * @param projectTypes The project types that need to be stringified
   * @returns A string of project names, separated by commas
   */
  stringifyProjectTypes(projectTypes: ProjectType[]): string {
    if (!projectTypes || !Array.isArray(projectTypes)) {
      return '';
    }
    const filteredProjectTypes = projectTypes.filter(pt => true === pt.checked);
    const projectTypeNames = filteredProjectTypes.map(pt => pt.name).sort();
    return projectTypeNames ? projectTypeNames.join(', ') : '';
  }

  /**
   * Applies data to the table.
   */
  setTableData() {
    let projectList = [];
    if (this.projects && this.projects.length > 0) {
      this.projects.forEach(project => {
        projectList.push(
          {
            _id: project._id,
            name: project.name,
            partner: project.partner,
            overlappingRegionalDistricts: this.stringifyOverlappingDistricts(project.overlappingRegionalDistricts as string | string[]),
            projectTypes: this.stringifyProjectTypes(project.projectTypes),
          }
        );
      });
      this.projectTableData = new TableObject(
        ProjectListTableRowsComponent,
        projectList,
        this.tableParams
      );
    }
  }

  /**
   * Handles a column sort event from the table.
   * 
   * @param column The column to sort by.
   */
  handleColumnSort(column: string) {
    if (this.tableParams.sortBy.includes(column)) {
      this.tableParams.sortBy = this.tableParams.sortBy.includes('+') ? `-${column}` : `+${column}`;
    } else {
      this.tableParams.sortBy = `+${column}`;
    }
    this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, this.filterForURL, this.tableParams.keywords, this.tableParams.projectTypes)
    this.sortProjects();
    this.setTableData();
  }

  /**
   * Sorts the projects.
   */
  sortProjects() {
    const sortBy = this.tableParams.sortBy.substring(1);
    const direction = '+' === this.tableParams.sortBy.charAt(0) ? 1 : -1;
    // Special case for project types. Data must be parsed.
    if ('projectTypes' === sortBy) {
      this.projects.sort((a, b) => {
        const aProj = this.stringifyProjectTypes(a.projectTypes);
        const bProj = this.stringifyProjectTypes(b.projectTypes);
        return aProj.localeCompare(bProj) * direction;
      });
    } else {
      this.projects.sort((a, b) => {  
        return a[sortBy].localeCompare(b[sortBy]) * direction;
      });
    }
  }

  /**
   * Handles a page change event from the table.
   * 
   * @param pageNumber The new page number to apply.
   * @returns {void}
   */
  handlePageChange(pageNumber: number): void {
    this.tableParams.currentPage = pageNumber;
    this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, this.filterForURL, this.tableParams.keywords, this.tableParams.projectTypes)
    this.sortProjects();
    this.setTableData();
  }

  public onSubmit() {
    // dismiss any open snackbar
    if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    let params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage ?? 1;
    params['sortBy'] = this.tableParams.sortBy ?? '+name';
    params['keywords'] = this.tableParams.keywords;
    params['pageSize'] = this.tableParams.pageSize ?? 10;
    params['projectTypes'] = this.tableParams.projectTypes;

    this.router.navigate(['projects-list'], params);
  }

  ngOnDestroy() {
    console.warn('AppComponent destroyed'); // Should never show unless true reload
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
