import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { zip } from 'rxjs';

import { ProjectService } from 'app/services/project.service';
import { SurveyService } from 'app/services/survey.service';
import { SearchService } from 'app/services/search.service';

@Injectable()
export class ProjectResolver {

  constructor(private projectService: ProjectService,
              private surveyService: SurveyService,
              private searchService: SearchService) { }

  resolve(route: ActivatedRouteSnapshot) {
    const projectId = route.pathFromRoot
      .map(r => r.paramMap.get('projId'))
      .find(id => !!id);

    if (!projectId) {return};

    // force-reload so we always have latest data
    let start = new Date();
    let end = new Date();
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);

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
