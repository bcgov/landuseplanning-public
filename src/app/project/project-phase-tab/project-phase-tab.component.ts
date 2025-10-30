import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import 'rxjs/add/operator/takeUntil';

import { Project } from 'app/models/project';
import { ApiService } from 'app/services/api';
import { ProjectService } from 'app/services/project.service';

interface ProjectProcessImages {
  default: {
    'Initiate Planning': string;
    'Develop a Plan': string,
    'Approve the Plan': string,
    'Implement the Plan': string,
  }
  forest: {
    'Pre-Planning': string,
    'Values Identification and Assessment': string,
    'Plan Development': string,
    'Plan Establishment': string,
    'Plan Implementation and Monitoring': string,
  }
}

@Component({
  templateUrl: './project-phase-tab.component.html',
  styleUrls: ['./project-phase-tab.component.scss']
})
export class ProjectPhaseTabComponent implements OnInit, OnDestroy {
  public project: Project = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public projectProcessImages: ProjectProcessImages = {
    default: {
      'Initiate Planning': '/assets/images/lwp-phase1.png',
      'Develop a Plan': '/assets/images/lwp-phase2.png',
      'Approve the Plan': '/assets/images/lwp-phase3.png',
      'Implement the Plan': '/assets/images/lwp-phase4.png',
    },
    forest: {
      'Pre-Planning': '/assets/images/flp-phase1.png',
      'Values Identification and Assessment': '/assets/images/flp-phase2.png',
      'Plan Development': '/assets/images/flp-phase3.png',
      'Plan Establishment': '/assets/images/flp-phase4.png',
      'Plan Implementation and Monitoring': '/assets/images/flp-phase5.png',
    }
  }
  public chosenImage: string;
  public altText: string;
  public isForestProject: boolean;

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
            this.isForestProject = this.project.projectTypes?.[1]?.checked;
            this.chosenImage = this.getChosenImage();
            this.altText = this.getAltText();
          } else {
            alert('Uh-oh, couldn\'t load project');
            // project not found --> navigate back to project list
            this.router.navigate(['/projects']);
          }
        }
      );
  }

  // Retrieves the appropriate alt text based on the project types and project phase.
  public getAltText() {
    const projectPhase = this.project.projectPhase || (this.isForestProject ? 'Pre-Planning' : 'Initiate Planning');
    const phaseIndex = this.isForestProject ? Object.keys(this.projectProcessImages.forest).indexOf(projectPhase) : Object.keys(this.projectProcessImages.default).indexOf(projectPhase);
    return `Phase ${phaseIndex + 1}: ${projectPhase}.`;
  }

  // Retrieves the appropriate phase image based on the project types and project phase.
  public getChosenImage() {
    if (this.isForestProject && Object.keys(this.projectProcessImages.forest).includes(this.project.projectPhase)) {
      return this.projectProcessImages.forest[this.project.projectPhase];
    } else if (Object.keys(this.projectProcessImages.default).includes(this.project.projectPhase)) {
      return this.projectProcessImages.default[this.project.projectPhase];
    } else {
      return this.isForestProject ? this.projectProcessImages.forest['Pre-Planning'] : this.projectProcessImages.default['Initiate Planning'];
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
