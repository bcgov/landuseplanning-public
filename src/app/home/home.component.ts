import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfigService } from 'app/services/config.service';

@Component({
  selector: 'app-home',
  template: ''
})

export class HomeComponent {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private configService: ConfigService
  ) {
    // (re)load applications component optionally with Splash modal
    const showSplashModal = this.route.snapshot.paramMap.get('showSplashModal');
    this.configService.showSplashModal = (showSplashModal === 'true');
    this.router.navigate(['/applications']);
  }

}
