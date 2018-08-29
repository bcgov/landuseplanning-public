import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})

export class ApplicationsComponent implements OnInit, OnDestroy {
  public loading = true; // for spinner
  public allApps: Array<Application> = [];
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private applicationService: ApplicationService
  ) { }

  ngOnInit() {
    // get all apps
    this.applicationService.getAll()
      .takeUntil(this.ngUnsubscribe)
      .subscribe(applications => {
        // sort by newest first
        this.allApps = applications.sort((a: Application, b: Application) => {
          return (a.publishDate < b.publishDate) ? 1 : -1;
        });
        this.loading = false;
      }, error => {
        console.log(error);
        alert('Uh-oh, couldn\'t load applications');
        // applications not found --> navigate back to home
        this.router.navigate(['/']);
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
