import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Project } from 'app/models/project';
import { ApiService } from 'app/services/api';
import { ProjectService } from 'app/services/project.service';
import { EmailSubscribe } from 'app/models/emailSubscribe';
import { EmailSubscribeService } from 'app/services/emailSubscribe.service';

@Component({
  templateUrl: './email-subscribe.component.html',
  styleUrls: ['./email-subscribe.component.scss']
})
export class EmailSubscribeComponent implements OnInit {
  @Input() project: Project;

  public currentPage = 1;
  public submitting = false;
  private emailSubscribe: EmailSubscribe;
  public emailAddress: any;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public activeModal: NgbActiveModal,
    private route: ActivatedRoute,
    private router: Router,
    public api: ApiService, // used in template
    public projectService: ProjectService, // used in template
    private emailSubscribeService: EmailSubscribeService,
  ) { }

  ngOnInit() {
    this.emailSubscribe = new EmailSubscribe();
    this.emailSubscribe.project = this.project._id;
  }

  register() {
  }

  private p1_next() {
    this.currentPage++;
  }

  private p2_back() {
    this.currentPage--;
  }

  private p2_next() {
    this.submitting = true;

    // Build the email object
    this.emailSubscribe.email = this.emailAddress;

    this.emailSubscribeService.add(this.emailSubscribe)
      .toPromise()
      .then((emailSubscribe: EmailSubscribe) => {
        this.emailSubscribe = emailSubscribe;
        console.log('ES Object', this.emailSubscribe);
        return emailSubscribe;
      })
      .then(() => {
        this.submitting = false;
        this.currentPage++;
      })
      .catch(error => {
        console.log('error', error);
        alert('Uh-oh, error submitting email address');
        this.submitting = false;
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
