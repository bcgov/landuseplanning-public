import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { forkJoin, of, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators'

import { ProjectService } from 'app/services/project.service';
import { SurveyService } from 'app/services/survey.service';
import { Project } from 'app/models/project';

@Injectable()
export class ProjectResolver implements Resolve<Project> {

  constructor(private projectService: ProjectService,
              private surveyService: SurveyService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Project> {
    const projId = route.paramMap.get('projId');
    // force-reload so we always have latest data
    let start = new Date();
    let end = new Date();
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);

    return this.projectService.getById(projId, false, start.toISOString(), end.toISOString())
      // .mergeMap(
      //   (project: any) => {
      //     return this.surveyService.getSelectedSurveyByCPId(project.commentPeriodForBanner._id)
      //   }
      // )
      .catch(() => { return Observable.of(null); });

      // return forkJoin(
      //   from(this.projectService.getById(projId, false, start.toISOString(), end.toISOString())),
      //   from(this.surveyService.getSelectedSurveyByProjId(projId)),
      // ).map(([project, selectedSurvey]) => {
      //   return { project: project, selectedSurvey: selectedSurvey };
      // });
  }
}

