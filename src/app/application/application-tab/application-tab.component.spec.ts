import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationTabComponent } from './application-tab.component';

describe('ApplicationTabComponent', () => {
  let component: ApplicationTabComponent;
  let fixture: ComponentFixture<ApplicationTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationTabComponent ]
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
