import { Component } from '@angular/core';
import { Project } from 'app/models/project';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';

@Component({
  selector: 'proj-detail-popup',
  templateUrl: './proj-detail-popup.component.html',
  styleUrls: ['./proj-detail-popup.component.scss']
})

export class ProjDetailPopupComponent {
  public proj: Project = null;

  constructor(
    public projectService: ProjectService, // used in template
    public commentPeriodService: CommentPeriodService // used in template
  ) { }
}
