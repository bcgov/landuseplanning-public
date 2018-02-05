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
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ApplicationListComponent implements OnInit, OnDestroy {
  readonly openStates = ['ACCEPTED'];
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
          application => (!this.showOnlyOpenApps || this.openStates.includes(application.status))
        );
        console.log('applications =', applications);
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
