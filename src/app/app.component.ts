import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ApiService } from './services/api';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {
  isSafari: boolean;
  hostname: string;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public router: Router,
    private api: ApiService,
    private configService: ConfigService
  ) {
    // ref: https://stackoverflow.com/questions/5899783/detect-safari-using-jquery
    this.isSafari = (/^((?!chrome|android).)*safari/i.test(navigator.userAgent));

    // used for sharing links
    this.hostname = this.api.apiPath; // TODO: Wrong

    this.configService.init();
  }

  ngOnInit() {
    this.router.events
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      });
  }

  ngOnDestroy() {
    this.configService.destroy();

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
