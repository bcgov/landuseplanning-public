import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Project } from '../../models/project';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  // public properties
  loading: boolean;
  project: Project;

  tabLinks = [
    { label: 'Mine Summary', link: 'overview' },
    { label: 'Authorizations', link: 'authorizations' },
    { label: 'Compliance Oversight', link: 'compliance' },
    { label: 'Other Documents', link: 'docs' }
  ];

  // private fields
  private sub: Subscription;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.loading = true;

    // wait for the resolver to retrieve the project details from back-end
    this.sub = this.route.data.subscribe(
      (data: { project: Project }) => {
        this.loading = false;
        this.project = data.project;

        // project not found --> navigate back to project list
        if (!this.project || !this.project.code) {
          this.gotoProjectList();
        }
      },
      error => console.log(error)
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  gotoProjectList(): void {
    this.router.navigate(['/projects']);
  }

  gotoMap(): void {
    // pass along the id of the current project if available
    // so that the map component can show the popup for it.
    const projectId = this.project ? this.project.code : null;
    this.router.navigate(['/map', { project: projectId }]);
  }
}
