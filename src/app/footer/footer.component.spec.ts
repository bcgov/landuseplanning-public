import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from 'app/services/api';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  const apiServiceStub = {
    adminUrl: 'http://localhost:4000/admin/'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FooterComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: ApiService, useValue: apiServiceStub },
        {
          provide: BreakpointObserver,
          useValue: { observe: () => of({ matches: false }) }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays site map content when not on the projects page', () => {
    const compiled = fixture.debugElement.nativeElement;
    const heading = compiled.querySelector('#internal-links h2');
    expect(heading.textContent).toContain('Site Map');
  });
});
