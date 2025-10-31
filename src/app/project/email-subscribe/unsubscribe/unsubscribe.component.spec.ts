import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { UnsubscribeComponent } from './unsubscribe.component';
import { EmailSubscribeService } from 'app/services/emailSubscribe.service';

describe('UnsubscribeComponent', () => {
  let component: UnsubscribeComponent;
  let fixture: ComponentFixture<UnsubscribeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnsubscribeComponent ],
      imports: [FormsModule],
      providers: [
        { provide: EmailSubscribeService, useValue: { unsubscribe: () => of(null) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnsubscribeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
