import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
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
export class EmailSubscribeComponent implements OnInit, OnDestroy {
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
    if (this.project) {
      this.emailSubscribe.project = this.project._id;
      return;
    }

    if (this.route.parent) {
      this.route.parent.data
        .takeUntil(this.ngUnsubscribe)
        .subscribe(parentData => {
          if (parentData && parentData.project) {
            this.project = parentData.project;
            this.emailSubscribe.project = this.project._id;
          } else {
            this.router.navigate(['/projects']);
          }
        });
    } else {
      this.router.navigate(['/projects']);
    }
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
