import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';

import { CommentsTableRowsComponent } from './comments-table-rows.component';
import { ApiService } from 'app/services/api';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Document } from 'app/models/document';

describe('ExpandableItemsComponent', () => {
  let component: CommentsTableRowsComponent;
  let fixture: ComponentFixture<CommentsTableRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentsTableRowsComponent ],
      imports: [NgxPaginationModule],
      providers: [
        { provide: ApiService, useValue: { getDocument: () => of([[new Document({})]]), openDocument: jasmine.createSpy('openDocument') } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentsTableRowsComponent);
    component = fixture.componentInstance;
    component.data = new TableObject(
      null,
      [{
        documents: [],
        comment: 'Test comment',
        dateAdded: new Date(),
        author: 'Author',
        Anonymous: false
      }],
      { currentPage: 1, pageSize: 5, totalListItems: 1 }
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
