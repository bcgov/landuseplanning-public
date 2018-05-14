import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplistListComponent } from './applist-list.component';

describe('ApplistListComponent', () => {
  let component: ApplistListComponent;
  let fixture: ComponentFixture<ApplistListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplistListComponent]
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
