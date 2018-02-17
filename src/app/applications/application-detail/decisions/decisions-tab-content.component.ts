import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { Application } from 'app/models/application';
import { Decision } from 'app/models/decision';
import { Document } from 'app/models/document';
import { ApiService } from 'app/services/api';
import { DecisionService } from 'app/services/decision.service';

@Component({
  templateUrl: './decisions-tab-content.component.html',
  styleUrls: ['./decisions-tab-content.component.scss'],
  animations: [
    trigger('visibility', [
      transition(':enter', [   // :enter is alias to 'void => *'
        animate('0.2s 0s', style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate('0.2s 0.75s', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class DecisionsTabContentComponent implements OnInit, OnDestroy {
  public loading = true;
  public application: Application;
  public decision: Decision;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private decisionService: DecisionService
  ) { }

  ngOnInit() {
    // this.loading = true;
    // NOTE: leave this.application and this.decision undefined

    // get application
    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { application: Application }) => {
          if (data.application) {
            this.application = data.application;

            // get application decision
            this.decisionService.getByApplicationId(this.application._id)
              .takeUntil(this.ngUnsubscribe)
              .subscribe(
                decision => {
                  this.decision = decision;
                  this.loading = false;
                },
                error => {
                  console.log(error);
                  this.loading = false;
                }
              );
          } else {
            console.log('ERROR =', 'missing application');
            this.loading = false;
          }
        },
        error => {
          console.log(error);
          this.loading = false;
        }
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private isUndefined(x): boolean {
    return (typeof x === 'undefined');
  }
}
