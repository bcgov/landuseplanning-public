import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { forkJoin, of, from, combineLatest, zip } from 'rxjs';
import { mergeMap } from 'rxjs/operators'

import { ProjectService } from 'app/services/project.service';
import { SurveyService } from 'app/services/survey.service';
import { SearchService } from 'app/services/search.service';
import { Project } from 'app/models/project';

@Injectable()
export class ProjectResolver {

  constructor(private projectService: ProjectService,
              private surveyService: SurveyService,
              private searchService: SearchService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // force-reload so we always have latest data
    let start = new Date();
    let end = new Date();
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);

    const projectId = route.paramMap.get('projId');
    const currentPage = route.params.currentPage ? route.params.currentPage : 1;
    const pageSize = route.params.pageSize ? route.params.pageSize : 10;
    const sortBy = route.params.sortBy && route.params.sortBy !== 'null' ? route.params.sortBy : '-datePosted';
    const keywords = route.params.keywords;

    return zip(
      this.projectService.getById(projectId, false, start.toISOString(), end.toISOString()),
      this.searchService.getSearchResults(keywords, 'Document', [{ 'name': 'project', 'value': projectId }], currentPage, pageSize, sortBy, {documentSource: 'BANNER'}, true)
    )
  }
}
