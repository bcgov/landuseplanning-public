import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { DocumentDetailComponent } from './detail.component';
import { ApiService } from 'app/services/api';
import { StorageService } from 'app/services/storage.service';
import { Document } from 'app/models/document';
import { Project } from 'app/models/project';
import { ListConverterPipe } from 'app/shared/pipes/list-converter.pipe';
import { ConfigService } from 'app/services/config.service';

describe('DetailComponent', () => {
  let component: DocumentDetailComponent;
  let fixture: ComponentFixture<DocumentDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentDetailComponent, ListConverterPipe ],
      imports: [RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { data: of({ document: new Document({ _id: 'doc-1', labels: [] }) }) } },
        { provide: ApiService, useValue: { openDocument: jasmine.createSpy('openDocument'), downloadDocument: jasmine.createSpy('downloadDocument') } },
        { provide: StorageService, useValue: { state: { currentProject: { data: new Project({ _id: 'proj-1', name: 'Project 1' }) }, selectedDocs: [], labels: [] } } },
        { provide: ConfigService, useValue: { lists: [] } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
