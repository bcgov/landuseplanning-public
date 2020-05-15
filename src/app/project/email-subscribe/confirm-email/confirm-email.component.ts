import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { EmailSubscribeService } from 'app/services/emailSubscribe.service';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss']
})
export class ConfirmEmailComponent implements OnInit {

  public emailAddress;
  private confirmKey;
  public emailConfirmed;
  public loading;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private emailSubscribeService: EmailSubscribeService,
  ) { }

  ngOnInit() {
    this.loading = true;
    this.emailConfirmed = false;
    // get data from route resolver
    this.route.paramMap
      .subscribe(params => {
        this.emailAddress = params.get('emailAddress');
        this.confirmKey = params.get('confirmKey');
      });

    // make the confirm call
    this.emailSubscribeService.confirm(this.emailAddress, this.confirmKey)
      .subscribe( data => {
          console.log('subscribe', data);
          this.emailConfirmed = true;
          this.loading = false;
      },
      error => {
        console.log('Confirm error:', error);
      }
      )
  }

}
