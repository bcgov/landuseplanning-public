import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Application } from 'app/models/application';

@Component({
  selector: 'app-application-tab-content',
  templateUrl: './application-tab-content.component.html',
  styleUrls: ['./application-tab-content.component.scss']
})
export class ApplicationTabContentComponent implements OnInit, OnDestroy {
  public loading: boolean;
  public application: Application;
  private sub: Subscription;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loading = true;
    this.application = null;

    this.sub = this.route.parent.data.subscribe(
      (data: { application: Application }) => {
        if (data.application) {
          this.application = data.application;
        }
      },
      error => console.log(error),
      () => this.loading = false
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getHref(document: Document): string {
    // TODO: http://.../document/<id>/document
    // build using api.apiPath etc
    // call api helper?
    return '#';
  }
}
