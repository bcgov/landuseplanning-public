import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';

import { MatCheckboxChange } from '@angular/material/checkbox';

import { Project } from 'app/models/project';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { ProjectType } from 'app/models/project';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';

export interface UpdateMatchingData {
  source: string;
  activeFilters: string[];
}

@Component({
  selector: 'app-project-list-filters',
  templateUrl: './project-list-filters.component.html',
  styleUrls: ['./project-list-filters.component.scss']
})

export class ProjectListFiltersComponent implements OnInit, OnChanges, OnDestroy {
  @Input() projects: Array<Project> = []; // from project list component
  @Input() tableParams: TableParamsObject = new TableParamsObject(); // from project list component
  @Output() updateMatching = new EventEmitter<UpdateMatchingData>(); // to project list component

  public loading = false;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public applyFilterCount = 0;

  public projectTypeFilters: ProjectType[] = [
    { name: 'Land Use Planning', checked: true },
    { name: 'Forest Landscape Planning', checked: true },
    { name: 'Water Planning and Governance', checked: true },
    { name: 'Conservation Planning', checked: true }
  ];

  public fullNames = {
    lup: 'Land Use Planning',
    flp: 'Forest Landscape Planning',
    wpag: 'Water Planning and Governance',
    cp: 'Conservation Planning',
  }

  constructor(
    public commentPeriodService: CommentPeriodService, // also used in template
  ) {}

  // Apply all filters and emit data to parent component
  public ngOnInit() {
    this.internalApplyAllFilters();
  }

  // Triggered when the change detection is triggered from the parent component.
  public ngOnChanges() {
    this.internalApplyAllFilters('search');
  }

  /**
   * Applies the current this.tableParams values to the filter controls.
   */
  public applyParamsToFilterControls() {
    if (this.tableParams.projectTypes) {
      const projectTypesArray = this.tableParams.projectTypes.split(',');
      const expandedProjectTypesArray = projectTypesArray.map(item => this.fullNames[item] || item);
      this.projectTypeFilters.forEach(ptf => {
        ptf.checked = expandedProjectTypesArray.includes(ptf.name) || 'all' === this.tableParams.projectTypes ? true : false;
  });
    }
    this.applyFilterCount++;
  }

  /**
   * Handles an event change to the project type filter
   *
   * @param {MatCheckboxChange} event The event that is passed from the project type filter checkbox
   * @returns {void}
   */
  public handleProjectTypeChange(event: MatCheckboxChange): void {
    const index = this.projectTypeFilters.map(filter => filter.name).indexOf(event.source.value);
    if (-1 !== index) {
      this.projectTypeFilters[index].checked = event.checked;
      this.internalApplyAllFilters('project type filter');
    }
  }

  /**
   * Applies filters by getting those that are selected, passing them to the shared table component, and then emitting an event so that the table is updated.
   *
   * @param source The source of the call to this method (optional)
   * @returns {void}
   */
  private internalApplyAllFilters(source: string = 'filter'): void {
    // This runs before ngOnInit, so we need set the filter controls on the first iteration
    if (this.applyFilterCount === 0) {
      this.applyParamsToFilterControls();
    }
    this.projects.forEach(proj => proj.isMatches = this.showThisProject(proj));

    // Define an array of abreviated project types, based on which ones are active
    const activeFilters = this.projectTypeFilters
      .filter(ptf => ptf.checked)
      .map(ptf => ptf.name.match(/\b\w/g).join('').toLowerCase());

    const returnData = {
      source,
      activeFilters,
    };

    // Update table params
    this.tableParams.projectTypes = activeFilters.join(',');

    // Notify parent component
    this.updateMatching.emit(returnData);
  }

  /**
   * Runs every time a filter is toggled.
   * Check if one of the project type filters matches. If so, return true.
   *
   * @param item The individual project to make the check for.
   * @returns 'true' if a match occurs. False if not.
   */
  private showThisProject(item: Project): boolean {
    let doesMatch = true;
    // If there are any filters unchecked, validate all project type filters
    if (this.projectTypeFilters.find(ptf => !ptf.checked)) {
      // If project is old and doesn't have projectTypes, allow it to be shown in list anyway.
      if (!item.hasOwnProperty('projectTypes') || !Array.isArray(item.projectTypes)) {
        return true;
      }

      const checkedProjectFilterTypeNames = this.projectTypeFilters.filter(ptf => ptf.checked).map(ptf => ptf.name);
      const checkedProjectTypeNames = item.projectTypes.filter(pt => pt.checked).map(pt => pt.name);
      const projectTypesToShow = checkedProjectTypeNames.filter(pt => checkedProjectFilterTypeNames.includes(pt));

      // If there are still project type(s) to show after filtering unchecked ones, return true.
      doesMatch = Boolean(projectTypesToShow.length);
    }
    return doesMatch;
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
