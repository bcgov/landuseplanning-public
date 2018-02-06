import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { PaginationInstance } from 'ngx-pagination';
import { Subscription } from 'rxjs/Subscription';

import { Application } from '../../models/application';
import { ApplicationService } from '../../services/application.service';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss'],
  // TODO: improve change detection
  // https://blog.thoughtram.io/angular/2016/02/22/angular-2-change-detection-explained.html
  // https://blog.angular-university.io/how-does-angular-2-change-detection-really-work/
  // https://blog.angular-university.io/onpush-change-detection-how-it-works/
  changeDetection: ChangeDetectionStrategy.Default
})

export class ApplicationListComponent implements OnInit, OnDestroy {
  readonly openStates = ['OPEN', 'SCHEDULED'];
  public applications: Array<Application>;
  public loading: boolean;
  public config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 10,
    currentPage: 1
  };
  private showOnlyOpenApps = true;
  private sub: Subscription;

  constructor(
    private router: Router,
    private applicationService: ApplicationService,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.applications = [];
    this.getApplications();
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  private getApplications() {
    this.loading = true;

    this.sub = this.applicationService.getAll()
      .subscribe(
      applications => {
        this.loading = false;
        this.applications = applications.filter(
          application => true, // (!this.showOnlyOpenApps || this.openStates.includes(application.commentingStatus))
        );
        console.log('applications =', this.applications);
        // Needed in development mode - not required in prod.
        this._changeDetectionRef.detectChanges();
      },
      error => {
        this.loading = false;
        alert('Error loading applications');
      });
  }

  private showChange(e) {
    this.showOnlyOpenApps = e.target.checked;
    this.getApplications();
  }
}
