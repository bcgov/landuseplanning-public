import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Application } from 'app/models/application';
import { CommentPeriod } from 'app/models/commentperiod';

@Component({
  selector: 'app-comments-tab-content',
  templateUrl: './comments-tab-content.component.html',
  styleUrls: ['./comments-tab-content.component.scss']
})
export class CommentsTabContentComponent implements OnInit, OnDestroy {
  public loading: boolean;
  public application: Application;
  public currentPeriod: CommentPeriod;
  private sub: Subscription;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loading = true;
    this.application = null;
    this.currentPeriod = null;

    this.sub = this.route.parent.data.subscribe(
      (data: { application: Application }) => {
        if (data.application) {
          this.application = data.application;
          if (data.application.periods) {
            this.currentPeriod = data.application.periods[0];
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
