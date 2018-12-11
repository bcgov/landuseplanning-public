import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationTabComponent } from './application-tab.component';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from 'app/services/api';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Application } from 'app/models/application';
import { ActivatedRoute } from '@angular/router';

describe('ApplicationTabComponent', () => {
  let component: ApplicationTabComponent;
  let fixture: ComponentFixture<ApplicationTabComponent>;
  const apiServiceStub = {
    getDocumentUrl() {
      return 'http://prc-api/documents/1/download';
    }
  };

  const existingApplication = new Application();

  const activatedRouteStub = {
    parent: {
      data: Observable.of({application: existingApplication}),
      snapshot: {}
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ApplicationTabComponent, NewlinesPipe],
      providers: [
        { provide: ApiService, useValue: apiServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
