import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppListComponent } from './app-list.component';
import { RouterTestingModule } from '@angular/router/testing';
import { VarDirective } from 'app/utils/ng-var.directive';
import { CommentPeriodService } from 'app/services/commentperiod.service';

describe('AppListComponent', () => {
  let component: AppListComponent;
  let fixture: ComponentFixture<AppListComponent>;
  const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getApplications']);
  const commentPeriodService = new CommentPeriodService(
    apiServiceSpy
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppListComponent, VarDirective],
      imports: [RouterTestingModule],
      providers: [
        { provide: CommentPeriodService, useValue: commentPeriodService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
