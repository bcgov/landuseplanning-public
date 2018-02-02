import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Application } from 'app/models/application';
import { Decision } from 'app/models/decision';
import { DecisionService } from 'app/services/decision.service';

@Component({
  selector: 'app-decision-tab-content',
  templateUrl: './decision-tab-content.component.html',
  styleUrls: ['./decision-tab-content.component.scss']
})
export class DecisionTabContentComponent implements OnInit, OnDestroy {
  public loading: boolean;
  public decision: Decision;
  private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private decisionService: DecisionService) { }

  ngOnInit(): void {
    this.loading = true;
    this.decision = null;

    this.sub = this.route.parent.data.subscribe(
      (data: { application: Application }) => {
        if (data.application && data.application._decision) {
          this.decisionService.getById(data.application._decision).subscribe(
            decision => {
              this.decision = decision;
            },
            error => console.log(error)
          );
        }
      },
      error => console.log(error),
      () => this.loading = false
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
