import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewTabContentComponent } from './overview-tab-content.component';

describe('OverviewTabContentComponent', () => {
  let component: OverviewTabContentComponent;
  let fixture: ComponentFixture<OverviewTabContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverviewTabContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewTabContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
