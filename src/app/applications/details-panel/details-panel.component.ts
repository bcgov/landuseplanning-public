import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { CommentModalComponent } from 'app/comment-modal/comment-modal.component';
import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { ApiService } from 'app/services/api';
import { UrlService } from 'app/services/url.service';

@Component({
  selector: 'app-details-panel',
  templateUrl: './details-panel.component.html',
  styleUrls: ['./details-panel.component.scss']
})
export class DetailsPanelComponent implements OnInit, OnDestroy {

  @Output() loadingApp = new EventEmitter(); // to applications component
  @Output() setCurrentApp = new EventEmitter(); // to applications component
  @Output() unsetCurrentApp = new EventEmitter(); // to applications component

  public isAppLoading: boolean;
  public application: Application = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  private addCommentModal: NgbModalRef = null;

  constructor(
    private modalService: NgbModal,
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
        // TODO: could also get 'id' from event.url
        const id = this.urlService.query('id');
        if (!id) {
          // nothing to display
          this.application = null;
        } else if (!this.application) {
          // notify applications component that we will have an app
          this.loadingApp.emit();
          // initial load
          this.loadApp(id);
        } else if (this.application._id !== id) {
          // notify applications component that we will have an app
          this.loadingApp.emit();
          // load new app
          this.application = null;
          this.loadApp(id);
        }
      });
  }

  private loadApp(id: string) {
    this.isAppLoading = true;
    // load entire application so we get extra data (documents, decision, features)
    this.applicationService.getById(id, true)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        application => {
          this.isAppLoading = false;
          if (application) { // safety check
            this.application = application;

            // save parameter
            this.urlService.save('id', this.application._id);

            // notify applications component to set new app
            this.setCurrentApp.emit(this.application);
          }
        },
        error => {
          this.isAppLoading = false;
          console.log('error =', error);
          alert('Uh-oh, couldn\'t load application');
        }
      );
  }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.addCommentModal) { this.addCommentModal.dismiss('addCommentModal dismissed'); }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public clearAllFilters() {
    if (this.application) {
      // notify applications component to unset current app
      this.unsetCurrentApp.emit(this.application);
      this.urlService.save('id', null);
    }
  }

  public addComment() {
    if (this.application.currentPeriod) {
      // open modal
      this.addCommentModal = this.modalService.open(CommentModalComponent, { backdrop: 'static', size: 'lg' });
      // set input parameter
      (<CommentModalComponent>this.addCommentModal.componentInstance).currentPeriod = this.application.currentPeriod;
      // check result
      this.addCommentModal.result.then(
        value => {
          // saved
          console.log(`Add Comment succeeded, value = ${value}`);
        },
        reason => {
          // cancelled
          console.log(`Add Comment cancelled, reason = ${reason}`);
        }
      );
    }
  }

}
