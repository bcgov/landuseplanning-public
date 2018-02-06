import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Project } from '../../../models/project';
import { CollectionsArray } from '../../../models/collection';

@Component({
  selector: 'app-compliance-tab-content',
  templateUrl: './compliance-tab-content.component.html',
  styleUrls: ['./compliance-tab-content.component.scss']
})
export class ComplianceTabContentComponent implements OnInit, OnDestroy {
  // public properties
  loading: boolean;
  project: Project;
  collections: CollectionsArray;

  sortField: string;
  sortAsc: boolean;
  sortDirection: number;

  // private fields
  private sub: Subscription;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.loading = true;
    this.sub = this.route.parent.data.subscribe(
      (data: { project: Project }) => {
        if (data.project && data.project.collections) {
          this.project = data.project;
          this.collections = data.project.collections.compliance;

          // Default sort will be descending by date
          this.sortField = 'date';
          this.sortAsc = false;
          this.sortDirection = -1;
        }
      },
      error => console.log(error),
      () => this.loading = false
    );
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  sort(field: string) {
    // Reverse order if this is already sort field
    if (this.sortField === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      // Ascending sort of the new field
      this.sortField = field;
      this.sortAsc = true;
    }
    this.sortDirection = this.sortAsc ? 1 : -1;
  }
}
