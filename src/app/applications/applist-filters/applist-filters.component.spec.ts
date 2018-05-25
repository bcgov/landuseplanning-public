import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplistFiltersComponent } from './applist-filters.component';

describe('ApplistFiltersComponent', () => {
  let component: ApplistFiltersComponent;
  let fixture: ComponentFixture<ApplistFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplistFiltersComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplistFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
