import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public isMapPage = false;
  public isVisible: boolean;

  constructor(
    public router: Router
  ) { }
  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // We have to account for matrix params and anchor links.
        this.isMapPage = '/projects' === event.urlAfterRedirects.split('#')[0] || '/projects' === event.urlAfterRedirects.split(';')[0];
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
}
