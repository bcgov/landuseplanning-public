import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';
import { map, mergeMap, takeUntil, filter } from 'rxjs/operators';
import { isEmpty } from 'lodash';

import { ApiService } from 'app/services/api';
import { ConfigService } from 'app/services/config.service';
import { SeoService } from 'app/services/seo.service';

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
    private seoService: SeoService,
  ) {

    // Set the app name. Used as part of dynamically set page titles.
    this.appName = 'Planning in Partnership';

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
        // Set page title
        const pageTitle = event['title'] || 'Home';
        this.titleService.setTitle(pageTitle + ' - ' + this.appName);

        // Extract project data if available from route data or parent route
        let projectImage = null;
        let projectName = null;
        let projectDescription = null;

        // Check current route and parent routes for project data
        let currentRoute = this.activatedRoute;
        while (currentRoute) {
          const routeData = currentRoute.snapshot.data;
          if (routeData['projectAndBanner']) {
            const project = routeData['projectAndBanner'][0];
            const bannerDocs = routeData['projectAndBanner'][1];

            projectName = project?.name;
            projectDescription = project?.description;

            // Get banner image if available
            if (bannerDocs && bannerDocs[0]?.data?.searchResults?.length > 0) {
              const bannerDoc = bannerDocs[0].data.searchResults[0];
              const remote_api_path = window.localStorage.getItem('from_public_server--remote_api_base_path');
              const pathAPI = (isEmpty(remote_api_path)) ? 'http://localhost:3000/api' : remote_api_path;
              projectImage = `${pathAPI}/document/${bannerDoc._id}/fetch/${bannerDoc.documentFileName.replace(/ /g, '_')}`;
            }
            break;
          }
          currentRoute = currentRoute.firstChild;
        }

        // Update SEO meta tags
        const currentUrl = this.seoService.getFullUrl(this.router.url.split('?')[0].split('#')[0]);

        // Build description - combine route-specific description with project description snippet
        let description = event['description'] || 'Find, learn about, and comment on active land and water planning engagements in British Columbia.';

        // If we have both a route description and project description, append a snippet of the project description
        if (event['description'] && projectDescription) {
          // Limit project description to first 100 characters for a snippet
          const projectSnippet = projectDescription.length > 100
            ? projectDescription.substring(0, 100).trim() + '...'
            : projectDescription;
          description = `${event['description']} ${projectSnippet}`;
        } else if (!event['description'] && projectDescription) {
          // Only use project description as fallback if no route description exists
          description = projectDescription;
        }

        // Build title - use project name if available for any project page
        let metaTitle = pageTitle;
        if (projectName && pageTitle.startsWith('Project')) {
          // For project pages like "Project Details", "Project Documents", etc., use the project name
          metaTitle = `${projectName} - ${pageTitle}`;
        }

        const seoConfig = {
          title: metaTitle,
          description: description,
          url: currentUrl,
          robots: event['robots'] || 'index, follow',
          image: projectImage || event['image'] || '/assets/images/lup_revelstoke.jpg'
        };
        this.seoService.updateMetaTags(seoConfig);

        // Set focus on h1 if required
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
