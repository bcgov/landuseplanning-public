import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjlistListComponent } from './projlist-list.component';
import { RouterTestingModule } from '@angular/router/testing';
import { VarDirective } from 'app/shared/utils/ng-var.directive';
import { ConfigService } from 'app/services/config.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';

// Todo: Uncomment and resolve errors.
// describe('ProjlistListComponent', () => {
//   let component: ProjlistListComponent;
//   let fixture: ComponentFixture<ProjlistListComponent>;
//   const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getProjects']);
//   const commentPeriodService = new CommentPeriodService(
//     apiServiceSpy
//   );

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ProjlistListComponent, VarDirective],
//       imports: [RouterTestingModule],
//       providers: [
//         ConfigService,
//         { provide: CommentPeriodService, useValue: commentPeriodService },
//       ]
//     })
//       .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(ProjlistListComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should be created', () => {
//     expect(component).toBeTruthy();
//   });
// });
