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

  ngOnInit(): void {
    this.loading = true;

    // wait for the resolver to retrieve the application details from back-end
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
      error => console.log(error)
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  gotoApplicationList(): void {
    this.router.navigate(['/applications']);
  }

  gotoMap(): void {
    // pass along the id of the current application if available
    // so that the map component can show the popup for it
    const applicationId = this.application ? this.application._id : null;
    this.router.navigate(['/map', { application: applicationId }]);
  }
}
