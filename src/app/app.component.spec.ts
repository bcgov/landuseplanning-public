import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'app/services/api';
import { ConfigService } from 'app/services/config.service';

describe('AppComponent', () => {
  const apiServiceStub = {
    apiPath: 'https://great-api.gov.bc.ca/api/public'
  };

  const configServiceStub = {
    init() { },
    destroy() { }
  };

  const cookieServiceStub = {
    get() { return 'true'; },
    check() { return false; },
    set() { }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        RouterTestingModule
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceStub },
        { provide: CookieService, useValue: cookieServiceStub },
        { provide: ConfigService, useValue: configServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it('should render the header component', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
  }));

  it('sets the hostname to the apiPath', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;

    expect(app.hostname).toEqual('https://great-api.gov.bc.ca/api/public');
  });
});
