import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';

import { TableTemplateComponent } from './table-template.component';
import { TableDirective } from './table.directive';
import { TableObject } from './table-object';
import { TableComponent } from './table.component';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({ selector: 'app-test-table-row', template: '' })
class TestTableRowComponent implements TableComponent {
  @Input() data: any;
}

describe('ItemTableComponent', () => {
  let component: TableTemplateComponent;
  let fixture: ComponentFixture<TableTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TableTemplateComponent, TableDirective, TestTableRowComponent],
      imports: [NgxPaginationModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableTemplateComponent);
    component = fixture.componentInstance;
    component.columns = [{ name: 'Name', value: 'name' }];
    component.data = new TableObject(TestTableRowComponent, [], { sortBy: '+name' });
    component.column = component.data.paginationData.sortBy;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
