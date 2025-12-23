import { Component, OnInit } from '@angular/core';
import { isEmpty } from 'lodash';

@Component({
  selector: 'app-env-banner',
  templateUrl: './env-banner.component.html',
  styleUrls: ['./env-banner.component.scss']
})
export class EnvBannerComponent implements OnInit {

  public env: string;  // Could be anything per Openshift settings but generally is one of 'local' | 'dev' | 'test' | 'prod' | 'demo'
  public showBanner: boolean;

  constructor() {
    const deployment_env = window.localStorage.getItem('from_public_server--deployment_env');

    this.env = (isEmpty(deployment_env)) ? 'prod' : deployment_env;
    if (this.env.toUpperCase() === 'PROD') {
      this.showBanner = false;
    } else {
      this.showBanner = true;
    }
    console.log('Env', this.env);
  }

  ngOnInit() {
  }

}
