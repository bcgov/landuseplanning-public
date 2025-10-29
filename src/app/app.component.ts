import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';
import { map, mergeMap, takeUntil, filter } from 'rxjs/operators';

import { ApiService } from 'app/services/api';
import { ConfigService } from 'app/services/config.service';

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
  isMapPage: boolean;
  windowTop = 0;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private cookieService: CookieService,
    private api: ApiService,
    private configService: ConfigService,
  ) {

    // Set the app name. Used as part of dynamically set page titles.
    this.appName = 'Land Use Planning';

    // ref: https://stackoverflow.com/questions/5899783/detect-safari-using-jquery
    this.isSafari = (/^((?!chrome|android).)*safari/i.test(navigator.userAgent));

    // used for sharing links
    this.hostname = api.apiPath; // TODO: Wrong
  }

  ngOnInit() {
    this.loggedIn = this.cookieService.get('loggedIn');
    this.showIntroModal = '';

    if (!this.cookieService.check('showIntroModal')) {
      this.cookieService.set('showIntroModal', 'true');
    }
    this.showIntroModal = this.cookieService.get('showIntroModal');

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // We have to account for matrix params and anchor links.
        this.isMapPage = '/projects' === event.urlAfterRedirects.split('#')[0] || '/projects' === event.urlAfterRedirects.split(';')[0];
      });
  }

  setViewTitleandFocus() {
    // If title(string) and focush1(boolean) fields exist in route data,
    // set "page" title and focush1 accordingly
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
      filter((route) => route.outlet === 'primary'),
      mergeMap((route) => route.data),
      takeUntil(this.ngUnsubscribe)
      )
      .subscribe(event => {
        this.titleService.setTitle(event['title'] + ' - ' + this.appName);
        let pageh1 = document.getElementsByTagName('h1')[0];
        if (pageh1 && event['focush1']) {
          pageh1.focus();
        }
  });
  }

  ngAfterViewInit() {
    this.setViewTitleandFocus();
  }

  ngOnDestroy() {
    this.configService.destroy();

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.windowTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }
}
