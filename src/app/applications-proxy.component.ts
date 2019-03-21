import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

//
// component to navigate to new application route
// see app-routing.module.ts
//

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'applications-proxy-component',
  template: ''
})
export class ApplicationsProxyComponent {
  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.navigate(['/applications'], {
      queryParams: { id: this.route.snapshot.params['id'] },
      fragment: 'details'
    });
  }
}
