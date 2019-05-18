import { Component, OnInit } from '@angular/core';

import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-project-details-tab',
  templateUrl: './project-details-tab.component.html',
  styleUrls: ['./project-details-tab.component.scss'],
})
export class ProjectDetailsTabComponent implements OnInit {
  public project;
  public commentPeriod = null;

  constructor(
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.project = this.storageService.state.currentProject.data;
    this.commentPeriod = this.project.upcomingCommentPeriod;
  }
}
