import { Component, OnInit, OnDestroy } from '@angular/core';
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
  styleUrls: ['./decisions-tab-content.component.scss']
})
export class DecisionsTabContentComponent implements OnInit, OnDestroy {
  public loading: boolean;
  public application: Application;
  public decision: Decision;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
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
                  decision => this.decision = decision,
                  error => console.log(error)
                );
            } else {
              // TODO: remove when API is implemented
              // this.application._decision = '';
              // this.decision = new Decision({
              //   date: new Date(),
              //   description: 'Et sea graecis intellegat intellegebat, ferri aperiri posidonium usu ex. Nihil meliore nec cu. Omnis'
              //     + ' augue liberavisse et pro, cum mandamus salutatus id.\\n\\nHendrerit complectitur eam eu. Ius officiis suavitate'
              //     + ' cu. Cu aeterno fierent cum, ex commodo qualisque principes his.'
              // });
              // this.decision.documents.push(new Document({ documentFileName: 'Document 1' }));
              // this.decision.documents.push(new Document({ documentFileName: 'Document 2' }));
              // this.decision.documents.push(new Document({ documentFileName: 'Document 3' }));
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
