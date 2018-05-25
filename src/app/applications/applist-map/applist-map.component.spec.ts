import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplistMapComponent } from './applist-map.component';

describe('ApplistMapComponent', () => {
  let component: ApplistMapComponent;
  let fixture: ComponentFixture<ApplistMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplistMapComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplistMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
