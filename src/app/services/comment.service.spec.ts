import { TestBed } from '@angular/core/testing';
import { Comment } from 'app/models/comment';
import { CommentPeriod } from 'app/models/commentperiod';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { ApiService } from './api';
import { CommentService } from './comment.service';
import { CommentPeriodService } from './commentperiod.service';
import { DocumentService } from './document.service';

describe('CommentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApiService,
          useValue: jasmine.createSpyObj('ApiService', [
            'getPeriodsByAppId',
            'getPeriod',
            'handleError'
          ])
        },
        {
          provide: CommentPeriodService,
          useValue: jasmine.createSpyObj('CommentPeriodService', [
            'getAllByApplicationId'
          ])
        },
        {
          provide: DocumentService,
          useValue: jasmine.createSpyObj('DocumentService', [
            'getAllByCommentId'
          ])
        },
        CommentService
      ]
    });
  });

  it('should be created', () => {
    const service = TestBed.get(CommentService);
    expect(service).toBeTruthy();
  });

  describe('getAllByApplicationId', () => {
    let service: CommentService;
    let commentPeriodServiceSpy;
    let apiSpy;
    beforeEach(() => {
      service = TestBed.get(CommentService);
      commentPeriodServiceSpy = TestBed.get(CommentPeriodService);
      apiSpy = TestBed.get(ApiService);
    });

    describe('when no comment periods are returned by the comment period service', () => {
      it('returns an empty Comment array', () => {
        commentPeriodServiceSpy.getAllByApplicationId.and.returnValue(
          Observable.of([] as CommentPeriod[])
        );
        service.getAllByApplicationId('123').subscribe(res => {
          expect(res).toEqual([] as Comment[]);
        });
      });
    });

    describe('when one comment period is returned by the comment period service', () => {
      describe('when the comment period contains no comments', () => {
        it('returns an empty comments array', () => {
          commentPeriodServiceSpy.getAllByApplicationId.and.returnValue(
            Observable.of([new CommentPeriod({ _id: '1' })])
          );

          // Return unique sets of comments each time CommentPeriodService#getAllByPeriodId is called
          spyOn(service, 'getAllByPeriodId').and.returnValues(
            Observable.of([] as Comment[]),
            Observable.of([
              new Comment({ _id: '33' }),
              new Comment({ _id: '44' })
            ])
          );

          // As CommentPeriodService#getAllByPeriodId is only called once, assert first pair of comments
          service.getAllByApplicationId('123').subscribe(res => {
            expect(res).toEqual([] as Comment[]);
          });
        });
      });

      describe('when the comment period contains one comment', () => {
        it('returns an array with one comment from the comment period', () => {
          commentPeriodServiceSpy.getAllByApplicationId.and.returnValue(
            Observable.of([new CommentPeriod({ _id: '1' })])
          );

          // Return unique sets of comments each time CommentPeriodService#getAllByPeriodId is called
          spyOn(service, 'getAllByPeriodId').and.returnValues(
            Observable.of([new Comment({ _id: '11' })]),
            Observable.of([
              new Comment({ _id: '44' }),
              new Comment({ _id: '55' })
            ])
          );

          // As CommentPeriodService#getAllByPeriodId is only called once, assert first pair of comments
          service.getAllByApplicationId('123').subscribe(res => {
            expect(res).toEqual([new Comment({ _id: '11' })]);
          });
        });
      });

      describe('when the comment period contains multiple comments', () => {
        it('returns an array of comments from the comment period', () => {
          commentPeriodServiceSpy.getAllByApplicationId.and.returnValue(
            Observable.of([new CommentPeriod({ _id: '1' })])
          );

          // Return unique sets of comments each time CommentPeriodService#getAllByPeriodId is called
          spyOn(service, 'getAllByPeriodId').and.returnValues(
            Observable.of([
              new Comment({ _id: '11' }),
              new Comment({ _id: '22' }),
              new Comment({ _id: '33' })
            ]),
            Observable.of([
              new Comment({ _id: '44' }),
              new Comment({ _id: '55' })
            ])
          );

          // As CommentPeriodService#getAllByPeriodId is only called once, assert first pair of comments
          service.getAllByApplicationId('123').subscribe(res => {
            expect(res).toEqual([
              new Comment({ _id: '11' }),
              new Comment({ _id: '22' }),
              new Comment({ _id: '33' })
            ]);
          });
        });
      });
    });

    describe('when multiple comment periods are returned by the comment period service', () => {
      describe('when the comment periods contains no comments', () => {
        it('returns an empty comments array', () => {
          commentPeriodServiceSpy.getAllByApplicationId.and.returnValue(
            Observable.of([
              new CommentPeriod({ _id: '1' }),
              new CommentPeriod({ _id: '2' })
            ])
          );

          // Return unique sets of comments each time CommentPeriodService#getAllByPeriodId is called
          spyOn(service, 'getAllByPeriodId').and.returnValues(
            Observable.of([] as Comment[]),
            Observable.of([] as Comment[])
          );

          // As CommentPeriodService#getAllByPeriodId is only called once, assert first pair of comments
          service.getAllByApplicationId('123').subscribe(res => {
            expect(res).toEqual([] as Comment[]);
          });
        });
      });

      describe('when the comment periods contain one comment', () => {
        it('returns an array with one comment from the comment period', () => {
          commentPeriodServiceSpy.getAllByApplicationId.and.returnValue(
            Observable.of([
              new CommentPeriod({ _id: '1' }),
              new CommentPeriod({ _id: '2' })
            ])
          );

          // Return unique sets of comments each time CommentPeriodService#getAllByPeriodId is called
          spyOn(service, 'getAllByPeriodId').and.returnValues(
            Observable.of([new Comment({ _id: '11' })]),
            Observable.of([new Comment({ _id: '22' })])
          );

          // As CommentPeriodService#getAllByPeriodId is only called once, assert first pair of comments
          service.getAllByApplicationId('123').subscribe(res => {
            expect(res).toEqual([
              new Comment({ _id: '11' }),
              new Comment({ _id: '22' })
            ]);
          });
        });
      });

      describe('when the comment periods contain multiple comments', () => {
        it('returns an array of comments from the comment period', () => {
          commentPeriodServiceSpy.getAllByApplicationId.and.returnValue(
            Observable.of([
              new CommentPeriod({ _id: '1' }),
              new CommentPeriod({ _id: '2' })
            ])
          );

          // Return unique sets of comments each time CommentPeriodService#getAllByPeriodId is called
          spyOn(service, 'getAllByPeriodId').and.returnValues(
            Observable.of([
              new Comment({ _id: '11' }),
              new Comment({ _id: '22' }),
              new Comment({ _id: '33' })
            ]),
            Observable.of([
              new Comment({ _id: '44' }),
              new Comment({ _id: '55' })
            ])
          );

          // As CommentPeriodService#getAllByPeriodId is only called once, assert first pair of comments
          service.getAllByApplicationId('123').subscribe(res => {
            expect(res).toEqual([
              new Comment({ _id: '11' }),
              new Comment({ _id: '22' }),
              new Comment({ _id: '33' }),
              new Comment({ _id: '44' }),
              new Comment({ _id: '55' })
            ]);
          });
        });
      });
    });

    describe('when an exception is thrown', () => {
      it('ApiService.handleError is called and the error is re-thrown', () => {
        commentPeriodServiceSpy.getAllByApplicationId.and.returnValue(() => {
          Observable.of(() => {
            throw Error('someError');
          });
        });
        apiSpy.handleError.and.callFake(error => {
          console.log('**********************');
          console.log(error);
          expect(error).toEqual(Error('someError'));
          return Observable.throw(Error('someRethrownError'));
        });

        service.getAllByApplicationId('123').subscribe(
          () => {
            fail('An error was expected.');
          },
          err => {
            expect(err).toEqual(Error('someRethrownError'));
          }
        );
      });
    });
  });
});
