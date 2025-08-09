import { Component } from '@angular/core';
import { ApiService } from 'app/services/api';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  constructor(public api: ApiService, public router: Router, private breakpointObserver: BreakpointObserver) {

    // Get the viewport to determine how we display the footer show/hide toggle.
    this.breakpointObserver.observe(['(max-width: 767px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }
  public footerHidden = false;
  public footerHideSymbol = '<';
  public isMobile: boolean;

  /**
   * Shows or hides the footer in mobile mode
   * 
   * @returns void
   */
  public showHideFooter = function() {
    this.footerHidden = !this.footerHidden;
    this.footerHideSymbol = '<' === this.footerHideSymbol ? '>' : '<';
  }
}
