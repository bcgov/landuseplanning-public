import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { InfoBannerService } from 'app/services/infoBanner.service';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  public isMapPage = false;
  public isVisible: boolean;
  public infoBannerDismissed = false;
  public bannerEnabled: string;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public router: Router,
    private infoBannerService: InfoBannerService,
  ) {
    this.bannerEnabled = window.localStorage.getItem('from_public_server--enable_info_banner') || 'false';
  }

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event: NavigationEnd) => {
        // We have to account for matrix params and anchor links.
        this.isMapPage = '/projects' === event.urlAfterRedirects.split('#')[0] || '/projects' === event.urlAfterRedirects.split(';')[0];
      });

    this.infoBannerService.bannerVisible$
      .takeUntil(this.ngUnsubscribe)
      .subscribe((visible) => {
        this.infoBannerDismissed = !visible && this.bannerEnabled === 'true';
      });
  }

  dropDownVisible() {
    this.isVisible = true;
  }

  dropDownHide() {
    this.isVisible = false;
  }

  public scrollTo(targetId: string): void {
    const element = document.getElementById(targetId);
    if (element) {
      this.router.navigate([], { fragment: targetId });
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  public enableBanner(): void {
    this.infoBannerService.showBanner();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
