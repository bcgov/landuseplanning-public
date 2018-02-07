import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { Application } from 'app/models/application';
import { Decision } from 'app/models/decision';
import { DecisionService } from 'app/services/decision.service';

@Component({
  templateUrl: './decisions-tab-content.component.html',
  styleUrls: ['./decisions-tab-content.component.scss']
})
export class DecisionsTabContentComponent implements OnInit, OnDestroy {
  public loading: boolean;
  public application: Application;
  public decision: Decision;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private decisionService: DecisionService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.application = null;
    this.decision = null;

    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
      (data: { application: Application }) => {
        if (data.application) {
          this.application = data.application;

          // get application decision
          if (this.application._decision) {
            this.decisionService.getById(this.application._decision)
              .takeUntil(this.ngUnsubscribe)
              .subscribe(
              decision => {
                this.decision = new Decision(decision);
                console.log('this.decision =', this.decision);
              },
              error => console.log(error)
              );
          }
        }
      },
      error => console.log(error),
      () => this.loading = false
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
