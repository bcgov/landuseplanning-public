import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ConfirmEmailComponent } from './confirm-email.component';
import { EmailSubscribeService } from 'app/services/emailSubscribe.service';

describe('ConfirmEmailComponent', () => {
  let component: ConfirmEmailComponent;
  let fixture: ComponentFixture<ConfirmEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmEmailComponent ],
      imports: [RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ emailAddress: 'test@example.com', confirmKey: 'key123' })) } },
        { provide: EmailSubscribeService, useValue: { confirm: jasmine.createSpy('confirm').and.returnValue(of({})) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmEmailComponent);
    component = fixture.componentInstance;
    (component as any).activeModal = { dismiss: jasmine.createSpy('dismiss') };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
