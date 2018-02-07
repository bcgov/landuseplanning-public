import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { Application } from 'app/models/application';
import { Decision } from 'app/models/decision';
import { DecisionService } from 'app/services/decision.service';

@Component({
  templateUrl: './decision-tab-content.component.html',
  styleUrls: ['./decision-tab-content.component.scss']
})
export class DecisionTabContentComponent implements OnInit, OnDestroy {
  public loading: boolean;
  public application: Application;
  public decisions: Decision;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private decisionService: DecisionService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.application = null;
    this.decisions = null;

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
              decisions => {
                this.decisions = new Decision(decisions);
                console.log('this.decisions =', this.decisions);
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
