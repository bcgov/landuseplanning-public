import { Component, OnInit } from '@angular/core';
import { EmailSubscribeService } from 'app/services/emailSubscribe.service';

@Component({
  selector: 'app-unsubscribe',
  templateUrl: './unsubscribe.component.html',
  styleUrls: ['./unsubscribe.component.scss']
})
export class UnsubscribeComponent implements OnInit {

  public emailAddress: any;
  public unsubscribed;

  constructor(
    private emailSubscribeService: EmailSubscribeService,
  ) { }

  ngOnInit() {
    this.unsubscribed = false;
  }

  unsubscribe() {
    this.emailSubscribeService.unsubscribe(this.emailAddress)
      .subscribe(
        () => {
          this.unsubscribed = true;
        },
        error => {
          console.log('Unsubscribe error:', error);
        }
      );
  }

}
