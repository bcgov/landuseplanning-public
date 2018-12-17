import { Component, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { AddCommentComponent } from '../add-comment/add-comment.component';
import { Application } from 'app/models/application';
import { ConfigService } from 'app/services/config.service';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { ApiService } from 'app/services/api';
import { UrlService } from 'app/services/url.service';

@Component({
  selector: 'app-details',
  templateUrl: './app-details.component.html',
  styleUrls: ['./app-details.component.scss']
})
export class AppDetailsComponent implements OnDestroy {

  @Input() isLoading: boolean; // from applications component
  @Output() setCurrentApp = new EventEmitter(); // to applications component
  @Output() unsetCurrentApp = new EventEmitter(); // to applications component

  public isAppLoading: boolean;
  public application: Application = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  private ngbModal: NgbModalRef = null;

  constructor(
    private modalService: NgbModal,
    public configService: ConfigService,
    public applicationService: ApplicationService, // used in template
    public commentPeriodService: CommentPeriodService, // used in template
    public api: ApiService, // used in template
    private urlService: UrlService
  ) {
    // watch for URL param changes
    // NB: this must be in constructor to get initial parameters
    this.urlService.onNavEnd$
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        const id = this.urlService.query('id');
        if (!id) {
          // nothing to display
          this.application = null;
        } else if (!this.application) {
          // don't show splash modal
          // since there are parameters, assume the user knows what they're doing
          this.configService.showSplashModal = false;
          // initial load
          this._loadApp(id);
        } else if (this.application._id !== id) {
          // updated app
          this.application = null;
          this._loadApp(id);
        }
      });
  }

  private _loadApp(id: string) {
    this.isAppLoading = true;
    // load entire application so we get extra data (documents, decision, features)
    this.applicationService.getById(id, true)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        application => {
          this.isAppLoading = false;
          this.application = application;

          // save parameter
          this.urlService.save('id', this.application._id);

          // notify applications component
          this.setCurrentApp.emit(this.application);
        },
        error => {
          this.isAppLoading = false;
          this.clearAllFilters(); // in case id not found
          console.log('error =', error);
          alert('Uh-oh, couldn\'t load application');
        }
      );
  }

  ngOnDestroy() {
    // if (this.ngbModal) { this.ngbModal.dismiss('component destroyed'); }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public clearAllFilters() {
    if (this.application) {
      this.unsetCurrentApp.emit(this.application); // notify applications component
      this.urlService.save('id', null);
    }
  }

  public addComment() {
    if (this.application.currentPeriod) {
      // open modal
      this.ngbModal = this.modalService.open(AddCommentComponent, { backdrop: 'static', size: 'lg' });
      // set input parameter
      (<AddCommentComponent>this.ngbModal.componentInstance).currentPeriod = this.application.currentPeriod;
      // check result
      this.ngbModal.result.then(
        value => {
          // saved
          console.log(`Success, value = ${value}`);
        },
        reason => {
          // cancelled
          console.log(`Cancelled, reason = ${reason}`);
        }
      );
    }
  }

}
