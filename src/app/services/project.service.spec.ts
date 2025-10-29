import { TestBed, inject } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProjectService } from './project.service';
import { ApiService } from 'app/services/api';
import { Project } from 'app/models/project';
import { CommentPeriod } from 'app/models/commentperiod';

describe('ProjectService', () => {
  let service: ProjectService;
  let apiService: jasmine.SpyObj<ApiService>;

  const projectList = [
    { _id: 'AAAA', status: 'ACCEPTED', name: 'Project A' },
    { _id: 'BBBB', status: 'OFFERED', name: 'Project B' }
  ];

  const projectWithBanner = {
    _id: 'AAAA',
    status: 'ACCEPTED',
    name: 'Project A',
    commentPeriodForBanner: [{ _id: 'cp-1' }]
  };

  beforeEach(() => {
    apiService = jasmine.createSpyObj<ApiService>('ApiService', [
      'getProjects',
      'getProject',
      'getCountProjects',
      'handleError'
    ]);

    apiService.getProjects.and.returnValue(of(projectList));
    apiService.getProject.and.returnValue(of([projectWithBanner]));
    apiService.getCountProjects.and.returnValue(of(300));
    apiService.handleError.and.callFake(error => throwError(error));

    TestBed.configureTestingModule({
      providers: [
        ProjectService,
        { provide: ApiService, useValue: apiService }
      ]
    });

    service = TestBed.inject(ProjectService);
  });

  it('should be created', inject([ProjectService], (appService: ProjectService) => {
    expect(appService).toBeTruthy();
  }));

  describe('getCount()', () => {
    it('retrieves the total count from the ApiService', () => {
      service.getCount().subscribe(number => {
        expect(number).toEqual(300);
      });
    });
  });

  describe('getAll()', () => {
    it('returns projects as Project instances', () => {
      service.getAll().subscribe(projects => {
        expect(projects.length).toEqual(2);
        expect(projects[0]).toEqual(jasmine.any(Project));
        expect(projects[0]._id).toEqual('AAAA');
      });
    });

    it('passes filter arrays to ApiService.getProjects', () => {
      service.getAll(0, 10, { KO: true }, { OP: true }, { AC: true });
      expect(apiService.getProjects).toHaveBeenCalledWith(0, 10, ['KO'], ['OP'], ['AC'], null, null, null, null);
    });
  });

  describe('getById()', () => {
    const cachedProject = new Project({ _id: 'AAAA', name: 'Cached Project' });

    it('returns cached project when forceReload is false', () => {
      (service as any).project = cachedProject;
      service.getById('AAAA').subscribe(project => {
        expect(project).toBe(cachedProject);
      });
    });

    it('requests project from ApiService when forceReload is true', () => {
      (service as any).project = cachedProject;
      service.getById('AAAA', true).subscribe(project => {
        expect(apiService.getProject).toHaveBeenCalled();
        expect(project).toEqual(jasmine.any(Project));
        expect(project.commentPeriodForBanner).toEqual(jasmine.any(CommentPeriod));
      });
    });

    it('requests project from ApiService when none is cached', () => {
      (service as any).project = null;
      service.getById('AAAA').subscribe(project => {
        expect(apiService.getProject).toHaveBeenCalled();
        expect(project).toEqual(jasmine.any(Project));
      });
    });

    it('sets commentPeriodForBanner to null when no data is returned', () => {
      apiService.getProject.and.returnValue(of([{ _id: 'BBBB', commentPeriodForBanner: [] }]));
      service.getById('BBBB', true).subscribe(project => {
        expect(project.commentPeriodForBanner).toBeNull();
      });
    });
  });

});
