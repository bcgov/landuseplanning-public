import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplistListComponent } from './applist-list.component';
import { RouterTestingModule } from '@angular/router/testing';
import { VarDirective } from 'app/utils/ng-var.directive';
import { ConfigService } from 'app/services/config.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';

describe('ApplistListComponent', () => {
  let component: ApplistListComponent;
  let fixture: ComponentFixture<ApplistListComponent>;
  const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getApplications']);
  const commentPeriodService = new CommentPeriodService(
    apiServiceSpy
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplistListComponent, VarDirective],
      imports: [RouterTestingModule],
      providers: [
        ConfigService,
        { provide: CommentPeriodService, useValue: commentPeriodService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplistListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
