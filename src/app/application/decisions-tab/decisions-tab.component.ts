import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { Application } from 'app/models/application';
import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';

@Component({
  templateUrl: './decisions-tab.component.html',
  styleUrls: ['./decisions-tab.component.scss']
})
export class DecisionsTabComponent implements OnInit, OnDestroy {
  public application: Application = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public api: ApiService, // used in template
    public applicationService: ApplicationService // used in template
  ) { }

  ngOnInit() {
    // get application
    this.activatedRoute.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { application: Application }) => {
          if (data.application) {
            this.application = data.application;
          } else {
            alert('Uh-oh, couldn\'t load application');
            // application not found --> navigate back to application list
            this.router.navigate(['/applications']);
          }
        }
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
