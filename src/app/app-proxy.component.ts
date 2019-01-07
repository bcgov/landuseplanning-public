import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

//
// component to navigate to new application route
// see app-routing.module.ts
//

@Component({
  selector: 'app-proxy-component',
  template: ''
})
export class AppProxyComponent {
  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.navigate(['/applications'], { queryParams: { id: this.route.snapshot.params['id'] }, fragment: 'details' });
  }
}
