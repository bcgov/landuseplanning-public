import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, NavigationStart } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PageScrollConfig } from 'ngx-page-scroll';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs/Subject';
import { zip, Observable } from 'rxjs';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

import { ApiService } from 'app/services/api';
import { ConfigService } from 'app/services/config.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SplashModalComponent } from './splash-modal/splash-modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  appName: string;
  isSafari: boolean;
  loggedIn: string;
  hostname: string;
  showIntroModal: string;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private cookieService: CookieService,
    private api: ApiService,
    private configService: ConfigService,
    private modalService: NgbModal,
  ) {

    // Set the app name. Used as part of dynamically set page titles.
    this.appName = 'Land Use Planning';

    // ref: https://stackoverflow.com/questions/5899783/detect-safari-using-jquery
    this.isSafari = (/^((?!chrome|android).)*safari/i.test(navigator.userAgent));

    // used for sharing links
    this.hostname = api.apiPath; // TODO: Wrong

    PageScrollConfig.defaultScrollOffset = 50;
    PageScrollConfig.defaultEasingLogic = {
      ease: (t: number, b: number, c: number, d: number): number => {
        // easeInOutExpo easing
        if (t === 0) {
          return b;
        }
        if (t === d) {
          return b + c;
        }
        if ((t /= d / 2) < 1) {
          return c / 2 * Math.pow(2, 8 * (t - 1)) + b;
        }
        return c / 2 * (-Math.pow(2, -8 * --t) + 2) + b;
      }
    };

    // watch for URL param changes
    // NB: this must be in constructor to get initial filters

    // this.configService.init();
  }

  ngOnInit() {
    this.loggedIn = this.cookieService.get('loggedIn');

    this.showIntroModal = '';

    if (!this.cookieService.check('showIntroModal')) {
      this.cookieService.set('showIntroModal', 'true');
    }
    this.showIntroModal = this.cookieService.get('showIntroModal');

    this.routerConfig();

  }

  routerConfig() {
    // Return route data for end of routing event
    let routerNavEnd$ = this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .map(() => this.activatedRoute);

    // Return route data for beginning of routing event and correct if stream returns null
    let routerNavStartComponent$ = this.router.events
      .filter(event => event instanceof NavigationStart)
      .map(() => this.activatedRoute.firstChild)
      .map((event: any) => {
        if (event !== null) {
          return event;
        } else {
          return { 'component': { 'name': 'none' } };
        }
      })
      .map((event: any) => event.component.name)


    let routerNavEndComponent$ = routerNavEnd$
      .map((route: any) => route.firstChild.component.name)

    // Set page titles dependent on component loaded and route data
    routerNavEnd$
      .map((route) => {
        while (route.firstChild) {
          route = route.firstChild
        }
        return route;
      })
      .filter((route) => route.outlet === 'primary')
      .mergeMap((route) => route.data)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event) => {
        this.titleService.setTitle(event['title'] + ' - ' + this.appName);
      });

    // Focus the h1 element(when applicable) for ease of keyboard nav
    zip(routerNavStartComponent$, routerNavEndComponent$)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(([startComponent, endComponent]) => {
      let pageh1 = document.getElementsByTagName('h1')[0];
      if (startComponent === endComponent && pageh1) {
      } else if (startComponent !== 'ProjectComponent' && endComponent === 'ProjectComponent' && pageh1) {
        pageh1.focus();
      } else if (startComponent === 'ProjectComponent' && endComponent !== 'ProjectComponent' && pageh1) {
        pageh1.focus();
      } else if (pageh1) {
        pageh1.focus();
      }
    });
  }

  ngAfterViewInit() {
    // show splash modal (unless a sub-component has already turned off this flag)
    // do this in another event so it's not in current change detection cycle
    /*
    if (this.showIntroModal === 'true') {
      setTimeout(() => {
        // this.splashModal =
        this.modalService.open(SplashModalComponent, {
          backdrop: 'static',
          windowClass: 'splash-modal'
        });
        this.cookieService.set('showIntroModal', 'false');
      });
    }*/
    return;
  }

  ngOnDestroy() {
    this.configService.destroy();

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
