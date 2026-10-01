import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfoBannerService {
  private bannerVisible = new BehaviorSubject<boolean>(
    window.localStorage.getItem('info_banner_dismissed') !== 'true'
  );

  public bannerVisible$ = this.bannerVisible.asObservable();

  public showBanner(): void {
    window.localStorage.setItem('info_banner_dismissed', 'false');
    this.bannerVisible.next(true);
  }

  public hideBanner(): void {
    window.localStorage.setItem('info_banner_dismissed', 'true');
    this.bannerVisible.next(false);
  }
}
