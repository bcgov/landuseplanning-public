import { Component, OnDestroy, OnInit } from '@angular/core';
import { InfoBannerService } from 'app/services/infoBanner.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-info-banner',
  templateUrl: './info-banner.component.html',
  styleUrls: ['./info-banner.component.scss']
})
export class InfoBannerComponent implements OnInit, OnDestroy {

  public showBanner = false;
  public bannerEnabled: string;
  public bannerText: string;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private infoBannerService: InfoBannerService
  ) {
    this.bannerEnabled = window.localStorage.getItem('from_public_server--enable_info_banner') || 'false';

    this.bannerText = window.localStorage.getItem('from_public_server--info_banner_text') ||
      'Due to the provincial election period, this site is not being updated except for emerging public health ' +
        'and safety information or topics that are statutory in nature.';

    const bannerDismissed = window.localStorage.getItem('info_banner_dismissed') || 'false';

    if (bannerDismissed === 'false') {
      this.showBanner = this.bannerEnabled.toLowerCase() === 'true';
    }
  }

  ngOnInit(): void {
    this.infoBannerService.bannerVisible$
      .takeUntil(this.ngUnsubscribe)
      .subscribe((visible) => {
      this.showBanner = visible && this.bannerEnabled === 'true';
    });

  }

  public dismissBanner(): void {
    this.infoBannerService.hideBanner();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
