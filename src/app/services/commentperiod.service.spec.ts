import { TestBed, async } from '@angular/core/testing';
import { CommentPeriod } from 'app/models/commentperiod';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { ApiService } from './api';
import { CommentPeriodService } from './commentperiod.service';

describe('CommentPeriodService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApiService,
          useValue: jasmine.createSpyObj('ApiService', [
            'getPeriodsByProjId',
            'getPeriod',
            'handleError'
          ])
        },
        CommentPeriodService
      ]
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(CommentPeriodService);
    expect(service).toBeTruthy();
  });

  describe('getAllByProjectId', () => {
    let service: CommentPeriodService;
    let apiSpy;
    beforeEach(() => {
      service = TestBed.inject(CommentPeriodService);
      apiSpy = TestBed.inject(ApiService);
    });

    describe('when no comment periods are returned by the Api', () => {
      it('returns an empty CommentPeriod array', async(() => {
        apiSpy.getPeriodsByProjId.and.returnValue(
          Observable.of({ text: () => { } })
        );

        service
          .getAllByProjectId('123')
          .subscribe(result => expect(result).toEqual([] as CommentPeriod[]));
      }));
    });

    describe('when one comment period is returned by the Api', () => {
      it('returns an array with one CommentPeriod element', async(() => {
        apiSpy.getPeriodsByProjId.and.returnValue(
          Observable.of({ text: () => 'notNull', json: () => [{ _id: '1' }] })
        );

        service
          .getAllByProjectId('123')
          .subscribe(result =>
            expect(result).toEqual([new CommentPeriod({ _id: '1' })])
          );
      }));
    });

    describe('when multiple comment periods are returned by the Api', () => {
      it('returns an array with multiple CommentPeriod elements', async(() => {
        apiSpy.getPeriodsByProjId.and.returnValue(
          Observable.of({
            text: () => 'notNull',
            json: () => [{ _id: '1' }, { _id: '2' }, { _id: '3' }]
          })
        );

        service
          .getAllByProjectId('123')
          .subscribe(result =>
            expect(result).toEqual([
              new CommentPeriod({ _id: '1' }),
              new CommentPeriod({ _id: '2' }),
              new CommentPeriod({ _id: '3' })
            ])
          );
      }));
    });

    describe('when an exception is thrown', () => {
      it('ApiService.handleError is called and the error is re-thrown', async(() => {
        apiSpy.getPeriodsByProjId.and.returnValue(
          Observable.of({
            text: () => {
              throw Error('someError');
            }
          })
        );
        apiSpy.handleError.and.callFake(error => {
          expect(error).toEqual(Error('someError'));
          return Observable.throw(Error('someRethrownError'));
        });

        service.getAllByProjectId('123').subscribe(
          () => {
            fail('An error was expected.');
          },
          err => {
            expect(err).toEqual(Error('someRethrownError'));
          }
        );
      }));
    });
  });

  describe('getById', () => {
    let service: CommentPeriodService;
    let apiSpy;
    beforeEach(() => {
      service = TestBed.inject(CommentPeriodService);
      apiSpy = TestBed.inject(ApiService);
    });

    describe('when forceReload is set to true', () => {
      describe('when no comment period is returned by the Api', () => {
        it('returns a null CommentPeriod', async(() => {
          apiSpy.getPeriod.and.returnValue(Observable.of({ text: () => { } }));

          service
            .getById('1')
            .subscribe(result => expect(result).toEqual(null as CommentPeriod));
        }));
      });

      describe('when one comment period is returned by the Api', () => {
        it('returns one CommentPeriod', async(() => {
          apiSpy.getPeriod.and.returnValue(
            Observable.of({ text: () => 'notNull', json: () => [{ _id: '1' }] })
          );

          service
            .getById('1')
            .subscribe(result =>
              expect(result).toEqual(new CommentPeriod({ _id: '1' }))
            );
        }));
      });

      describe('when multiple comment periods are returned by the Api', () => {
        it('returns only the first CommentPeriod', async(() => {
          apiSpy.getPeriod.and.returnValue(
            Observable.of({
              text: () => 'notNull',
              json: () => [{ _id: '1' }, { _id: '2' }, { _id: '3' }]
            })
          );

          service
            .getById('1')
            .subscribe(result =>
              expect(result).toEqual(new CommentPeriod({ _id: '1' }))
            );
        }));
      });
    });

    describe('when forceReload is set to false', () => {
      describe('when a comment period is cached', () => {
        beforeEach(async(() => {
          apiSpy.getPeriod.and.returnValues(
            Observable.of({
              text: () => 'notNull',
              json: () => [{ _id: '1' }]
            }),
            Observable.throw(
              Error(
                'Was not expecting ApiService.getPeriod to be called more than once.'
              )
            )
          );

          // call once to set the cache
          service.getById('1').subscribe();
        }));

        it('returns the cached comment period', async(() => {
          // assert cached comment period is returned
          service
            .getById('1')
            .subscribe(result =>
              expect(result).toEqual(new CommentPeriod({ _id: '1' }))
            );
        }));
      });

      describe('when no comment period is cached', () => {
        it('calls the api to fetch a comment period', async(() => {
          apiSpy.getPeriod.and.returnValue(
            Observable.of({ text: () => 'notNull', json: () => [{ _id: '3' }] })
          );

          service
            .getById('1')
            .subscribe(result =>
              expect(result).toEqual(new CommentPeriod({ _id: '3' }))
            );
        }));
      });
    });

    describe('when an exception is thrown', () => {
      it('ApiService.handleError is called and the error is re-thrown', async(() => {
        apiSpy.getPeriod.and.returnValue(
          Observable.of({
            text: () => {
              throw Error('someError');
            }
          })
        );
        apiSpy.handleError.and.callFake(error => {
          expect(error).toEqual(Error('someError'));
          return Observable.throw(Error('someRethrownError'));
        });

        service.getById('1').subscribe(
          () => {
            fail('An error was expected.');
          },
          err => {
            expect(err).toEqual(Error('someRethrownError'));
          }
        );
      }));
    });
  });

  describe('getCurrent', () => {
    let service: CommentPeriodService;
    beforeEach(() => {
      service = TestBed.inject(CommentPeriodService);
    });

    describe('when no comment periods provided', () => {
      it('returns a null CommentPeriod', () => {
        expect(service.getCurrent([] as CommentPeriod[])).toEqual(
          null as CommentPeriod
        );
      });
    });

    describe('when one comment period provided', () => {
      it('returns the CommentPeriod', () => {
        const commentPeriod = new CommentPeriod({ _id: '1' });
        const commentPeriods: CommentPeriod[] = [commentPeriod];
        expect(service.getCurrent(commentPeriods)).toEqual(commentPeriod);
      });
    });

    describe('when multiple comment periods provided', () => {
      it('returns only the first CommentPeriod', () => {
        const commentPeriod = new CommentPeriod({ _id: '1' });
        const commentPeriods: CommentPeriod[] = [
          commentPeriod,
          new CommentPeriod({ _id: '2' }),
          new CommentPeriod({ _id: '3' })
        ];
        expect(service.getCurrent(commentPeriods)).toEqual(commentPeriod);
      });
    });
  });

  describe('getStatusCode', () => {
    let service: CommentPeriodService;
    let today: Date;
    beforeEach(() => {
      service = TestBed.inject(CommentPeriodService);
      today = new Date();
    });

    describe('when no comment period is provided', () => {
      it('returns a NOT OPEN status', () => {
        expect(service.getStatusCode(null as CommentPeriod)).toEqual(
          service.NOT_OPEN
        );
      });
    });

    describe('when a comment period is provided', () => {
      describe('when the comment period is missing the start date', () => {
        it('returns a NOT OPEN status', () => {
          const commentPeriod = new CommentPeriod({
            _id: '1',
            endDate: today
          });
          expect(service.getStatusCode(commentPeriod)).toEqual(
            service.NOT_OPEN
          );
        });
      });

      describe('when the comment period is missing the end date', () => {
        it('returns a NOT OPEN status', () => {
          const commentPeriod = new CommentPeriod({
            _id: '1',
            startDate: today
          });
          expect(service.getStatusCode(commentPeriod)).toEqual(
            service.NOT_OPEN
          );
        });
      });

      describe('when the comment period contains all required fields', () => {
        describe('when the end date is before today', () => {
          it('returns a CLOSED status', () => {
            const commentPeriod = new CommentPeriod({
              _id: '1',
              startDate: today,
              endDate: today.setDate(today.getDate() - 3)
            });
            expect(service.getStatusCode(commentPeriod)).toEqual(
              service.CLOSED
            );
          });
        });

        describe('when the start date is after today', () => {
          it('returns a NOT STARTED status', () => {
            const commentPeriod = new CommentPeriod({
              _id: '1',
              startDate: today.setDate(today.getDate() + 3),
              endDate: today.setDate(today.getDate() + 6)
            });
            expect(service.getStatusCode(commentPeriod)).toEqual(
              service.NOT_STARTED
            );
          });
        });

        describe('when the start date is before today and end date is after today', () => {
          it('returns a OPEN status', () => {
            const commentPeriod = new CommentPeriod({
              _id: '1',
              startDate: today.setDate(today.getDate() - 3),
              endDate: today.setDate(today.getDate() + 3)
            });
            expect(service.getStatusCode(commentPeriod)).toEqual(service.OPEN);
          });
        });
      });
    });
  });

  describe('getStatusString', () => {
    let service: CommentPeriodService;
    beforeEach(() => {
      service = TestBed.inject(CommentPeriodService);
    });

    it('returns a human readable NOT STARTED status string', () => {
      expect(service.getStatusString(service.NOT_STARTED)).toEqual(
        'Commenting Not Started'
      );
    });

    it('returns a human readable NOT OPEN status string', () => {
      expect(service.getStatusString(service.NOT_OPEN)).toEqual(
        'Not Open For Commenting'
      );
    });

    it('returns a human readable CLOSED status string', () => {
      expect(service.getStatusString(service.CLOSED)).toEqual(
        'Commenting Closed'
      );
    });

    it('returns a human readable OPEN status string', () => {
      expect(service.getStatusString(service.OPEN)).toEqual('Commenting Open');
    });
  });
});
