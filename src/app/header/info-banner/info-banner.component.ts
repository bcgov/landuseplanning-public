import { Component } from '@angular/core';

@Component({
  selector: 'app-info-banner',
  templateUrl: './info-banner.component.html',
  styleUrls: ['./info-banner.component.scss']
})
export class InfoBannerComponent {

  public showBanner: boolean;
  public bannerText: string;

  constructor() {
    const bannerEnabled = window.localStorage.getItem('from_public_server--enable_info_banner') || 'false';
    const bannerText = window.localStorage.getItem('from_public_server--info_banner_text') 
      || 'Due to the provincial election period, this site is not being updated except for emerging public health ' +
      'and safety information or topics that are statutory in nature.';
    const bannerDismissed = window.localStorage.getItem('info_banner_dismissed') || 'false';
    if (bannerDismissed === 'false') {
      this.showBanner = bannerEnabled.toLowerCase() === 'true';
    }
  }

  dismissBanner() {
    this.showBanner = false;
    window.localStorage.setItem('info_banner_dismissed', 'true');
  }
}
