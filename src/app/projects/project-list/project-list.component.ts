import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';

import { Project } from 'app/models/project';
import { SearchTerms } from 'app/models/search';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

import { ProjectListTableRowsComponent } from './project-list-table-rows/project-list-table-rows.component';

import { SearchService } from 'app/services/search.service';
import { StorageService } from 'app/services/storage.service';

class ProjectFilterObject {
  constructor(
    public type: object = {},
    public eacDecision: object = {},
    public decisionDateStart: object = {},
    public decisionDateEnd: object = {},
    public pcp: object = {},
    public proponent: object = {},
    public region: object = {},
    public CEAAInvolvement: object = {},
    public vc: object = {}
  ) { }
}

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})

export class ProjectListComponent implements OnInit, OnDestroy {
  public projects: Array<Project> = [];
  public loading = true;

  public showOnlyOpenApps: boolean;
  public tableParams: TableParamsObject = new TableParamsObject();
  public terms = new SearchTerms();

  public filterForURL: object = {};
  public filterForAPI: object = {};

  public filterForUI: ProjectFilterObject = new ProjectFilterObject();

  public showAdvancedSearch: boolean;

  public showFilters: object = {
    type: false,
    eacDecision: false,
    pcp: false,
    more: false
  };

  public numFilters: object = {
    type: 0,
    eacDecision: 0,
    pcp: 0,
    more: 0
  };

  public projectTableData: TableObject;
  public projectTableColumns: any[] = [
    {
      name: 'Name',
      value: 'name',
      width: 'col-2'
    },
    {
      name: 'Proponent',
      value: 'proponent.name',
      width: 'col-2'
    },
    {
      name: 'Type',
      value: 'type',
      width: 'col-2'
    },
    {
      name: 'Region',
      value: 'region',
      width: 'col-2'
    },
    {
      name: 'Phase',
      value: 'currentPhaseName',
      width: 'col-2'
    },
    {
      name: 'Decision',
      value: 'eacDecision',
      width: 'col-2'
    }
  ];

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  private TYPE_MAP: object = {
    energyElectricity: 'Energy-Electricity',
    energyPetroleum: 'Energy-Petroleum & Natural Gas',
    foodProcessing: 'Food Processing',
    industrial: 'Industrial',
    mines: 'Mines',
    other: 'Other',
    tourist: 'Tourist Destination Resorts',
    transportation: 'Transportation',
    wasteDisposal: 'Waste Disposal',
    waterManagement: 'Water Management'
  };

  private EAC_DECISIONS_MAP: object = {
    inProgress: 'In Progress',
    certificateIssued: 'Certificate Issued',
    certificateRefused: 'Certificate Refused',
    furtherAssessmentRequired: 'Further Assessment Required',
    certificateNotRequired: 'Certificate Not Required',
    certificateExpired: 'Certificate Expired',
    withdrawn: 'Withdrawn',
    terminated: 'Terminated',
    preEA: 'Pre-EA Act Approval',
    notReviewable: 'Not Designated Reviewable'
  };

  private REGION_MAP: object = {
    cariboo: 'Cariboo',
    kootenay: 'Kootenay',
    lowerMainland: 'Lower Mainland',
    okanagan: 'Okanagan',
    omineca: 'Omineca',
    peace: 'Peace',
    skeena: 'Skeena',
    thompsonNicola: 'Thompson-Nicola',
    vancouverIsland: 'Vancouver Island'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tableTemplateUtils: TableTemplateUtils,
    private storageService: StorageService,
    private searchService: SearchService,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        let newParams = params;

        if (Object.keys(newParams).length === 0 && newParams.constructor === Object) {
          newParams = {
            sortBy: '+name'
          };
        }

        this.setFiltersFromParams(params);

        this.updateCounts();

        this.showAdvancedSearch = (this.numFilters['type'] + this.numFilters['eacDecision'] + this.numFilters['pcp'] + this.numFilters['more'] > 0);

        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(newParams, this.filterForURL);

        this.searchService.getSearchResults(
          this.tableParams.keywords,
          'Project',
          [],
          this.tableParams.currentPage,
          this.tableParams.pageSize,
          this.tableParams.sortBy,
          {},
          true,
          null,
          this.filterForAPI)
          .takeUntil(this.ngUnsubscribe)
          .subscribe((res: any) => {
            if (res[0].data) {
              if (res[0].data.searchResults.length > 0) {
                this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
                this.projects = res[0].data.searchResults;
              } else {
                this.tableParams.totalListItems = 0;
                this.projects = [];
              }
              this.setRowData();
            } else {
              alert('Uh-oh, couldn\'t load topics');
              // project not found --> navigate back to search
              this.router.navigate(['/']);
            }
            this.loading = false;
            this._changeDetectionRef.detectChanges();
          });
      });
  }

  addProject() {
    this.storageService.state.back = { url: ['/projects'], label: 'All Projects(s)' };
    this.router.navigate(['/projects', 'add']);
  }

  paramsToFilters(params, name, map = null) {
    this.filterForUI[name] = {};
    delete this.filterForURL[name];
    delete this.filterForAPI[name];

    if (params[name]) {
      this.filterForURL[name] = params[name];
      const values = params[name].split(',');
      let apiValues = [];
      values.forEach(value => {
        this.filterForUI[name][value] = true;
        apiValues.push(map && map[value] ? map[value] : value);
      });
      if (apiValues.length) {
        this.filterForAPI[name] = apiValues.join(',');
      }
    }
  }

  setFiltersFromParams(params) {
    this.paramsToFilters(params, 'type', this.TYPE_MAP);
    this.paramsToFilters(params, 'eacDecision', this.EAC_DECISIONS_MAP);
    this.paramsToFilters(params, 'region', this.REGION_MAP);

    this.paramsToFilters(params, 'pcp');
    this.paramsToFilters(params, 'proponent');
    this.paramsToFilters(params, 'CEAAInvolvement');
    this.paramsToFilters(params, 'vc');

    this.paramsToFilters(params, 'decisionDateStart');
    this.paramsToFilters(params, 'decisionDateEnd');
  }

  filterToParams(params, name) {
    let keys = [];
    Object.keys(this.filterForUI[name]).forEach(key => {
      if (this.filterForUI[name][key]) { keys.push(key); }
    });
    if (keys.length) { params[name] = keys.join(','); }
  }

  getParamsFromFilter(params) {
    this.filterToParams(params, 'type');
    this.filterToParams(params, 'eacDecision');
    this.filterToParams(params, 'pcp');
    this.filterToParams(params, 'region');

    this.filterToParams(params, 'proponent');
    this.filterToParams(params, 'CEAAInvolvement');
    this.filterToParams(params, 'vc');

    this.filterToParams(params, 'decisionDateStart');
    this.filterToParams(params, 'decisionDateEnd');
  }

  toggleFilter(name) {
    if (this.showFilters[name]) {
      this.updateCount(name);
      this.showFilters[name] = false;
    } else {
      Object.keys(this.showFilters).forEach(key => {
        if (this.showFilters[key]) {
          this.updateCount(key);
          this.showFilters[key] = false;
        }
      });
      this.showFilters[name] = true;
    }
  }

  clearAll() {
    Object.keys(this.filterForUI).forEach(key => {
      this.filterForUI[key] = {};
    });
    this.updateCounts();
  }

  updateCount(name) {
    const getCount = (n) => { return Object.keys(this.filterForUI[n]).filter(k => this.filterForUI[n][k]).length; };

    let num = 0;
    if (name === 'more') {
      num = getCount('region') + getCount('proponent') + getCount('CEAAInvolvement') + getCount('vc');
    } else {
      num = getCount(name);
    }
    this.numFilters[name] = num;
  }

  updateCounts() {
    this.updateCount('type');
    this.updateCount('eacDecision');
    this.updateCount('pcp');
    this.updateCount('more');
  }

  setRowData() {
    let projectList = [];
    if (this.projects && this.projects.length > 0) {
      this.projects.forEach(project => {
        projectList.push(
          {
            _id: project._id,
            name: project.name,
            proponent: project.proponent,
            type: project.type,
            region: project.region,
            currentPhaseName: project.currentPhaseName,
            eacDecision: project.eacDecision
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

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedProjects(this.tableParams.currentPage);
  }

  getPaginatedProjects(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.searchService.getSearchResults(
      this.tableParams.keywords,
      'Project',
      null,
      pageNumber,
      this.tableParams.pageSize,
      this.tableParams.sortBy,
      {},
      true,
      null,
      this.filterForAPI
    )
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res[0].data) {
          this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
          this.projects = res[0].data.searchResults;
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, this.filterForURL, this.tableParams.keywords);
          this.setRowData();
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        } else {
          alert('Uh-oh, couldn\'t load topics');
          // project not found --> navigate back to search
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

    let params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = 1;
    params['sortBy'] = this.tableParams.sortBy = '-score';
    params['keywords'] = this.tableParams.keywords;
    params['pageSize'] = this.tableParams.pageSize = 10;

    this.getParamsFromFilter(params);

    console.log('params', params);
    this.router.navigate(['projects-list', params]);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
