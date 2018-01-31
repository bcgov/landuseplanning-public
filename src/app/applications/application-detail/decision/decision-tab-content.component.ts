import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Application } from '../../../models/application';

@Component({
  selector: 'app-decision-tab-content',
  templateUrl: './decision-tab-content.component.html',
  styleUrls: ['./decision-tab-content.component.scss']
})
export class DecisionTabContentComponent implements OnInit, OnDestroy {
  public loading: boolean;
  public application: Application;
  public decision: string;

  private sub: Subscription;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loading = true;
    this.application = null;
    this.decision = null;

    this.sub = this.route.parent.data.subscribe(
      (data: { application: Application }) => {
        if (data.application) {
          this.application = data.application;
          if (data.application.decision) {
            this.decision = data.application.decision;
          }
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
