import { Component } from '@angular/core';
import { Project } from 'app/models/project';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { CommentPeriod } from 'app/models/commentperiod';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-proj-detail-popup',
  templateUrl: './proj-detail-popup.component.html',
  styleUrls: ['./proj-detail-popup.component.scss']
})

export class ProjDetailPopupComponent {
  public proj: Project = null;
  public commentPeriod: CommentPeriod = null;
  public commentPeriodStatus: String;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public projectService: ProjectService, // used in template
    public commentPeriodService: CommentPeriodService // used in template
  ) { }

  ngOnInit() {
    this.commentPeriodService.getAllByProjectId(this.proj._id)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(data => {
          this.commentPeriodStatus = data[0].commentPeriodStatus;
      });
  }
}
