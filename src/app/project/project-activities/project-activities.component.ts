import { Component, ChangeDetectorRef, OnDestroy, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { ActivitiesListTableRowsComponent } from './activities-list-table-rows/activities-list-table-rows.component';
import { Project } from 'app/models/project';

@Component({
  selector: 'app-project-activities',
  templateUrl: './project-activities.component.html',
  styleUrls: ['./project-activities.component.scss']
})
export class ProjectActivitiesComponent implements OnChanges, OnDestroy {
  @Input() project: Project;
  @Input() activities;
  @Input() tableParams: TableParamsObject;
  @Output() search = new EventEmitter<any>();

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public currentProject: Project;
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
    private _changeDetectionRef: ChangeDetectorRef) { }

  ngOnChanges() {
    const total = this.activities?.[0]?.meta?.[0]?.searchResultsTotal;
    this.tableParams.totalListItems = total || 0;
    this.setRowData();
  }

  setRowData() {
    if (this.activities?.length > 0) {
      this.tableData = new TableObject(
        ActivitiesListTableRowsComponent,
        this.activities,
        this.tableParams
      );
    }
  }

  // Column sort is not currently enabled for the table in this component
  setColumnSort(column: string) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.search.emit({ keywords: this.tableParams.keywords, currentPage: this.tableParams.currentPage });
  }
  
  public onSubmit() {
    this.search.emit({
      currentPage: 1,
      keywords: this.tableParams.keywords,
      sortBy: '-dateAdded',
      pageSize: 10
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
