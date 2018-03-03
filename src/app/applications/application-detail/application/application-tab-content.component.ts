import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { Application } from 'app/models/application';
import { ApiService } from 'app/services/api';

@Component({
  templateUrl: './application-tab-content.component.html',
  styleUrls: ['./application-tab-content.component.scss'],
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
export class ApplicationTabContentComponent implements OnInit, OnDestroy {
  public loading = true;
  public application: Application;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) { }

  ngOnInit() {
    // NOTE: leave this.application undefined

    // get application
    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { application: Application }) => {
          if (data.application) {
            this.application = data.application;
          } else {
            console.log('ERROR =', 'missing application');
          }
          this.loading = false;
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
