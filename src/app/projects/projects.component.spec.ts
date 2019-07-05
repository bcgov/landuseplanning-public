import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsComponent } from './projects.component';
import { ProjlistFiltersComponent } from 'app/projects/projlist-filters/projlist-filters.component';
import { ProjlistListComponent } from 'app/projects/projlist-list/projlist-list.component';
import { ProjlistMapComponent } from './projlist-map/projlist-map.component';
import { NgbModule, NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { VarDirective } from 'app/shared/utils/ng-var.directive';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar } from '@angular/material';
import { ProjectService } from 'app/services/project.service';
import { ConfigService } from 'app/services/config.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Project } from 'app/models/project';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;
  const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getProjects']);
  const commentPeriodService = new CommentPeriodService(
    apiServiceSpy
  );

  const projectServiceStub = {
    getCount() {
      return Observable.of(2);
    },

    getAllFull() {
      const projectOne = new Project();
      const projectTwo = new Project();
      return Observable.of([projectOne, projectTwo]);
    }
  };



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProjectsComponent,
        ProjlistFiltersComponent,
        ProjlistListComponent,
        ProjlistMapComponent,
        VarDirective
      ],
      imports: [
        NgbModule,
        FormsModule,
        RouterTestingModule,
      ],
      providers: [
        NgbTypeaheadConfig,
        { provide: ProjectService, useValue: projectServiceStub },
        { provide: MatSnackBar },
        { provide: ConfigService },
        { provide: CommentPeriodService, useValue: commentPeriodService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should be created', () => {
    expect(component).toBeTruthy();
  });
});