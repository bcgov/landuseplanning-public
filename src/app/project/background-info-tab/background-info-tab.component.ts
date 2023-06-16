import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import 'rxjs/add/operator/takeUntil';

import { Project } from 'app/models/project';
import { ApiService } from 'app/services/api';
import { ProjectService } from 'app/services/project.service';

@Component({
  templateUrl: './background-info-tab.component.html',
  styleUrls: ['./background-info-tab.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BackgroundInfoTabComponent implements OnInit, OnDestroy {
  public project: Project = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public api: ApiService, // used in template
    public projectService: ProjectService // used in template
  ) { }

  ngOnInit() {
    // get project
    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data) => {
          if (data.projectAndBanner[0]) {
            this.project = data.projectAndBanner[0];
          } else {
            alert('Uh-oh, couldn\'t load project');
            // project not found --> navigate back to project list
            this.router.navigate(['/projects']);
          }
        }
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
