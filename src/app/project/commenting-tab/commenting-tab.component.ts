import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

import { Project } from 'app/models/project';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { CommentPeriod } from 'app/models/commentperiod';

@Component({
  templateUrl: './commenting-tab.component.html',
  styleUrls: ['./commenting-tab.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('visibility', [
      transition(':enter', [   // :enter is alias to 'void => *'
        animate('0.2s 0s', style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate('0.2s 0.75s', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class CommentingTabComponent implements OnInit, OnDestroy {
  public currentProject: Project = null;
  public currentProjectEngagementInfo: SafeHtml;
  public loading = true;
  public commentPeriods: Array<CommentPeriod> = [];
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public commentPeriodService: CommentPeriodService, // used in template
    private _changeDetectionRef: ChangeDetectorRef,
    private domSanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    // get project
    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data) => {
          if (data.projectAndBanner[0]) {
            this.currentProject = data.projectAndBanner[0];
            console.log('lol', this.currentProject.engagementInfo)
            this.currentProjectEngagementInfo = this.domSanitizer.bypassSecurityTrustHtml(this.currentProject.engagementInfo);
            this.getCommentPeriods(data.projectAndBanner[0]._id);
          } else {
            alert('Uh-oh, couldn\'t load project');
            // project not found --> navigate back to project list
            this.router.navigate(['/projects']);
          }
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        }
      );
  }

  goToCP(commentPeriod) {
    this.router.navigate(['p', this.currentProject._id, 'cp', commentPeriod._id]);
  }

  getCommentPeriods(projectId) {
    this.commentPeriodService.getAllByProjectId(projectId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res.data) {
          this.commentPeriods = res.data;
          console.log('commenting-tab', res.data);
          this.commentPeriods.forEach(element => {
            // element.instructions = element.instructions.match(/Comment Period on the (.*?) for /)[1];
          });
        }
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
