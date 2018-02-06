import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
// import { TransformationType, Direction } from 'angular-coordinates';

import { Application } from '../../models/application';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})
export class ApplicationDetailComponent implements OnInit, OnDestroy {
  readonly tabLinks = [
    { label: 'Application', link: 'application' },
    { label: 'Comments', link: 'comments' },
    { label: 'Decision', link: 'decision' }
  ];

  public loading: boolean;
  public application: Application;

  private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.loading = true;
    this.application = null;

    this.sub = this.route.data.subscribe(
      (data: { application: Application }) => {
        this.loading = false;
        this.application = data.application;

        // application not found --> navigate back to application list
        if (!this.application || !this.application._id) {
          console.log('Application not found!');
          this.gotoApplicationList();
        }
      },
      error => {
        this.loading = false;
        console.log(error);
      }
    );
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  private gotoApplicationList() {
    this.router.navigate(['/applications']);
  }

  private gotoMap() {
    // pass along the id of the current application if available
    // so that the map component can show the popup for it
    const applicationId = this.application ? this.application._id : null;
    this.router.navigate(['/map', { application: applicationId }]);
  }
}
