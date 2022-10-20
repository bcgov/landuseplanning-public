import { TestBed, async } from '@angular/core/testing';
import { Comment } from 'app/models/comment';
import { CommentPeriod } from 'app/models/commentperiod';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { ApiService } from './api';
import { CommentService } from './comment.service';
import { CommentPeriodService } from './commentperiod.service';
import { DocumentService } from './document.service';
import { Document } from 'app/models/document';

describe('CommentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApiService,
          useValue: jasmine.createSpyObj('ApiService', [
            'getPeriodsByProjId',
            'getPeriod',
            'getCommentsByPeriodId',
            'getComment',
            'addComment',
            'handleError'
          ])
        },
        {
          provide: CommentPeriodService,
          useValue: jasmine.createSpyObj('CommentPeriodService', [
            'getAllByProjectId'
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
    const service = TestBed.inject(CommentService);
    expect(service).toBeTruthy();
  });

  describe('getAllByProjectId', () => {
    let service: CommentService;
    let commentPeriodServiceSpy;
    let apiSpy;
    beforeEach(() => {
      service = TestBed.inject(CommentService);
      commentPeriodServiceSpy = TestBed.inject(CommentPeriodService);
      apiSpy = TestBed.inject(ApiService);
    });

    //   describe('when no comment periods are returned by the comment period service', () => {
    //     it('returns an empty Comment array', async(() => {
    //       commentPeriodServiceSpy.getAllByProjectId.and.returnValue(
    //         Observable.of([] as CommentPeriod[])
    //       );
    //       service.getAllByProjectId('123').subscribe(res => {
    //         expect(res).toEqual([] as Comment[]);
    //       });
    //     }));
    //   });

    //   describe('when one comment period is returned by the comment period service', () => {
    //     describe('when the comment period contains no comments', () => {
    //       it('returns an empty comments array', async(() => {
    //         commentPeriodServiceSpy.getAllByProjectId.and.returnValue(
    //           Observable.of([new CommentPeriod({ _id: '1' })])
    //         );

    //         // Return unique sets of comments each time CommentPeriodService#getAllByPeriodId is called
    //         spyOn(service, 'getAllByPeriodId').and.returnValues(
    //           Observable.of([] as Comment[]),
    //           Observable.of([
    //             new Comment({ _id: '33' }),
    //             new Comment({ _id: '44' })
    //           ])
    //         );

    //         // As CommentPeriodService#getAllByPeriodId is only called once, assert first pair of comments
    //         service.getAllByProjectId('123').subscribe(res => {
    //           expect(res).toEqual([] as Comment[]);
    //         });
    //       }));
    //     });

    //     describe('when the comment period contains one comment', () => {
    //       it('returns an array with one comment from the comment period', async(() => {
    //         commentPeriodServiceSpy.getAllByProjectId.and.returnValue(
    //           Observable.of([new CommentPeriod({ _id: '1' })])
    //         );

    //         // Return unique sets of comments each time CommentPeriodService#getAllByPeriodId is called
    //         spyOn(service, 'getAllByPeriodId').and.returnValues(
    //           Observable.of([new Comment({ _id: '11' })]),
    //           Observable.of([
    //             new Comment({ _id: '44' }),
    //             new Comment({ _id: '55' })
    //           ])
    //         );

    //         // As CommentPeriodService#getAllByPeriodId is only called once, assert first pair of comments
    //         service.getAllByProjectId('123').subscribe(res => {
    //           expect(res).toEqual([new Comment({ _id: '11' })]);
    //         });
    //       }));
    //     });

    //     describe('when the comment period contains multiple comments', () => {
    //       it('returns an array of comments from the comment period', async(() => {
    //         commentPeriodServiceSpy.getAllByProjectId.and.returnValue(
    //           Observable.of([new CommentPeriod({ _id: '1' })])
    //         );

    //         // Return unique sets of comments each time CommentPeriodService#getAllByPeriodId is called
    //         spyOn(service, 'getAllByPeriodId').and.returnValues(
    //           Observable.of([
    //             new Comment({ _id: '11' }),
    //             new Comment({ _id: '22' }),
    //             new Comment({ _id: '33' })
    //           ]),
    //           Observable.of([
    //             new Comment({ _id: '44' }),
    //             new Comment({ _id: '55' })
    //           ])
    //         );

    //         // As CommentPeriodService#getAllByPeriodId is only called once, assert first pair of comments
    //         service.getAllByProjectId('123').subscribe(res => {
    //           expect(res).toEqual([
    //             new Comment({ _id: '11' }),
    //             new Comment({ _id: '22' }),
    //             new Comment({ _id: '33' })
    //           ]);
    //         });
    //       }));
    //     });
    //   });

    //   describe('when multiple comment periods are returned by the comment period service', () => {
    //     describe('when the comment periods contains no comments', () => {
    //       it('returns an empty comments array', async(() => {
    //         commentPeriodServiceSpy.getAllByProjectId.and.returnValue(
    //           Observable.of([
    //             new CommentPeriod({ _id: '1' }),
    //             new CommentPeriod({ _id: '2' })
    //           ])
    //         );

    //         // Return unique sets of comments each time CommentPeriodService#getAllByPeriodId is called
    //         spyOn(service, 'getAllByPeriodId').and.returnValues(
    //           Observable.of([] as Comment[]),
    //           Observable.of([] as Comment[])
    //         );

    //         // As CommentPeriodService#getAllByPeriodId is only called once, assert first pair of comments
    //         service.getAllByProjectId('123').subscribe(res => {
    //           expect(res).toEqual([] as Comment[]);
    //         });
    //       }));
    //     });

    //     describe('when the comment periods contain one comment', () => {
    //       it('returns an array with one comment from the comment period', async(() => {
    //         commentPeriodServiceSpy.getAllByProjectId.and.returnValue(
    //           Observable.of([
    //             new CommentPeriod({ _id: '1' }),
    //             new CommentPeriod({ _id: '2' })
    //           ])
    //         );

    //         // Return unique sets of comments each time CommentPeriodService#getAllByPeriodId is called
    //         spyOn(service, 'getAllByPeriodId').and.returnValues(
    //           Observable.of([new Comment({ _id: '11' })]),
    //           Observable.of([new Comment({ _id: '22' })])
    //         );

    //         // As CommentPeriodService#getAllByPeriodId is only called once, assert first pair of comments
    //         service.getAllByProjectId('123').subscribe(res => {
    //           expect(res).toEqual([
    //             new Comment({ _id: '11' }),
    //             new Comment({ _id: '22' })
    //           ]);
    //         });
    //       }));
    //     });

    //     describe('when the comment periods contain multiple comments', () => {
    //       it('returns an array of comments from the comment period', async(() => {
    //         commentPeriodServiceSpy.getAllByProjectId.and.returnValue(
    //           Observable.of([
    //             new CommentPeriod({ _id: '1' }),
    //             new CommentPeriod({ _id: '2' })
    //           ])
    //         );

    //         // Return unique sets of comments each time CommentPeriodService#getAllByPeriodId is called
    //         spyOn(service, 'getAllByPeriodId').and.returnValues(
    //           Observable.of([
    //             new Comment({ _id: '11' }),
    //             new Comment({ _id: '22' }),
    //             new Comment({ _id: '33' })
    //           ]),
    //           Observable.of([
    //             new Comment({ _id: '44' }),
    //             new Comment({ _id: '55' })
    //           ])
    //         );

    //         // As CommentPeriodService#getAllByPeriodId is only called once, assert first pair of comments
    //         service.getAllByProjectId('123').subscribe(res => {
    //           expect(res).toEqual([
    //             new Comment({ _id: '11' }),
    //             new Comment({ _id: '22' }),
    //             new Comment({ _id: '33' }),
    //             new Comment({ _id: '44' }),
    //             new Comment({ _id: '55' })
    //           ]);
    //         });
    //       }));
    //     });
    //   });

    //   describe('when an exception is thrown', () => {
    //     it('ApiService.handleError is called and the error is re-thrown', async(() => {
    //       commentPeriodServiceSpy.getAllByProjectId.and.returnValue(
    //         Observable.throw(Error('someError'))
    //       );

    //       spyOn(service, 'getAllByPeriodId').and.throwError('someError');

    //       apiSpy.handleError.and.callFake(error => {
    //         expect(error).toEqual(Error('someError'));
    //         return Observable.throw(Error('someRethrownError'));
    //       });

    //       service.getAllByProjectId('123').subscribe(
    //         () => {
    //           fail('An error was expected.');
    //         },
    //         err => {
    //           expect(err).toEqual(Error('someRethrownError'));
    //         }
    //       );
    //     }));
    //   });
    // });

    // describe('getAllByPeriodId', () => {
    //   let service: CommentService;
    //   let apiSpy;
    //   beforeEach(() => {
    //     service = TestBed.inject(CommentService);
    //     apiSpy = TestBed.inject(ApiService);
    //   });

    //   describe('when the comment period has no comments', () => {
    //     it('returns an empty Comment array', async(() => {
    //       apiSpy.getCommentsByPeriodId.and.returnValue(
    //         Observable.of({ text: () => {} })
    //       );
    //       service.getAllByPeriodId('1').subscribe(res => {
    //         expect(res).toEqual([] as Comment[]);
    //       });
    //     }));
    //   });

    //   describe('when the comment period has one comment', () => {
    //     it('returns an array with one Comment element', async(() => {
    //       apiSpy.getCommentsByPeriodId.and.returnValue(
    //         Observable.of({ text: () => 'notNull', json: () => [{ _id: '1' }] })
    //       );
    //       service.getAllByPeriodId('1').subscribe(res => {
    //         expect(res).toEqual([new Comment({ _id: '1' })]);
    //       });
    //     }));
    //   });

    //   describe('when the comment period has one comment', () => {
    //     it('returns an array with one Comment element', async(() => {
    //       apiSpy.getCommentsByPeriodId.and.returnValue(
    //         Observable.of({
    //           text: () => 'notNull',
    //           json: () => [{ _id: '1' }, { _id: '2' }, { _id: '3' }]
    //         })
    //       );
    //       service.getAllByPeriodId('1').subscribe(res => {
    //         expect(res).toEqual([
    //           new Comment({ _id: '1' }),
    //           new Comment({ _id: '2' }),
    //           new Comment({ _id: '3' })
    //         ]);
    //       });
    //     }));
    //   });

    //   describe('when an exception is thrown', () => {
    //     it('ApiService.handleError is called and the error is re-thrown', async(() => {
    //       apiSpy.getCommentsByPeriodId.and.returnValue(
    //         Observable.throw(Error('someError'))
    //       );

    //       apiSpy.handleError.and.callFake(error => {
    //         expect(error).toEqual(Error('someError'));
    //         return Observable.throw(Error('someRethrownError'));
    //       });

    //       service.getAllByPeriodId('123').subscribe(
    //         () => {
    //           fail('An error was expected.');
    //         },
    //         err => {
    //           expect(err).toEqual(Error('someRethrownError'));
    //         }
    //       );
    //     }));
    //   });
    // });

    // describe('getById', () => {
    //   let service: CommentService;
    //   let apiSpy;
    //   let documentServiceSpy;
    //   beforeEach(() => {
    //     service = TestBed.inject(CommentService);
    //     apiSpy = TestBed.inject(ApiService);
    //     documentServiceSpy = TestBed.inject(DocumentService);
    //   });

    //   describe('when forceReload is set to true', () => {
    //     describe('when no comment is returned by the Api', () => {
    //       it('returns a null Comment', async(() => {
    //         apiSpy.getComment.and.returnValue(Observable.of({ text: () => {} }));

    //         service
    //           .getById('1', true)
    //           .subscribe(result => expect(result).toEqual(null as Comment));
    //       }));
    //     });

    //     describe('when one comment is returned by the Api', () => {
    //       it('returns one Comment', async(() => {
    //         apiSpy.getComment.and.returnValue(
    //           Observable.of({ text: () => 'notNull', json: () => [{ _id: '1' }] })
    //         );

    //         documentServiceSpy.getAllByCommentId.and.returnValue(
    //           Observable.of([] as Document[])
    //         );

    //         service
    //           .getById('1', true)
    //           .subscribe(result =>
    //             expect(result).toEqual(new Comment({ _id: '1' }))
    //           );
    //       }));
    //     });

    //     describe('when multiple comments are returned by the Api', () => {
    //       it('returns only the first Comment', async(() => {
    //         apiSpy.getComment.and.returnValue(
    //           Observable.of({
    //             text: () => 'notNull',
    //             json: () => [{ _id: '1' }, { _id: '2' }, { _id: '3' }]
    //           })
    //         );

    //         documentServiceSpy.getAllByCommentId.and.returnValues(
    //           Observable.of([new Document({ _id: '6' })]),
    //           Observable.throw(
    //             Error(
    //               'Was not expecting DocumentService.getAllByCommentId to be called more than once.'
    //             )
    //           )
    //         );

    //         service.getById('1', true).subscribe(result => {
    //           expect(result).toEqual(
    //             new Comment({ _id: '1', documents: [new Document({ _id: '6' })] })
    //           );
    //         });
    //       }));
    //     });
    //   });

    //   describe('when forceReload is set to false', () => {
    //     describe('when a comment is cached', () => {
    //       beforeEach(async(() => {
    //         documentServiceSpy.getAllByCommentId.and.returnValues(
    //           Observable.of([new Document({ _id: '7' })]),
    //           Observable.throw(
    //             Error(
    //               'Was not expecting DocumentService.getAllByCommentId to be called more than once.'
    //             )
    //           )
    //         );

    //         apiSpy.getComment.and.returnValues(
    //           Observable.of({
    //             text: () => 'notNull',
    //             json: () => [{ _id: '1' }]
    //           }),
    //           Observable.throw(
    //             Error(
    //               'Was not expecting ApIService.getComment to be called more than once.'
    //             )
    //           )
    //         );

    //         // call once to set the cache
    //         service.getById('1', true).subscribe();
    //       }));

    //       it('returns the cached comment', async(() => {
    //         // assert cached comment period is returned
    //         service.getById('1').subscribe(result => {
    //           expect(result).toEqual(
    //             new Comment({ _id: '1', documents: [new Document({ _id: '7' })] })
    //           );
    //         });
    //       }));
    //     });

    //     describe('when no comment is cached', () => {
    //       it('calls the api to fetch a comment', async(() => {
    //         apiSpy.getComment.and.returnValue(
    //           Observable.of({ text: () => 'notNull', json: () => [{ _id: '3' }] })
    //         );

    //         documentServiceSpy.getAllByCommentId.and.returnValues(
    //           Observable.of([new Document({ _id: '8' })]),
    //           Observable.throw(
    //             Error(
    //               'Was not expecting DocumentService.getAllByCommentId to be called more than once.'
    //             )
    //           )
    //         );

    //         service.getById('1').subscribe(result => {
    //           expect(result).toEqual(
    //             new Comment({ _id: '3', documents: [new Document({ _id: '8' })] })
    //           );
    //         });
    //       }));
    //     });
    //   });

    //   describe('when an exception is thrown', () => {
    //     it('ApiService.handleError is called and the error is re-thrown', async(() => {
    //       apiSpy.getComment.and.returnValue(
    //         Observable.of({
    //           text: () => {
    //             throw Error('someError');
    //           }
    //         })
    //       );
    //       apiSpy.handleError.and.callFake(error => {
    //         expect(error).toEqual(Error('someError'));
    //         return Observable.throw(Error('someRethrownError'));
    //       });

    //       service.getById('1').subscribe(
    //         () => {
    //           fail('An error was expected.');
    //         },
    //         err => {
    //           expect(err).toEqual(Error('someRethrownError'));
    //         }
    //       );
    //     }));
    //   });
  });

  describe('add', () => {
    let service: CommentService;
    let apiSpy;
    beforeEach(() => {
      service = TestBed.inject(CommentService);
      apiSpy = TestBed.inject(ApiService);
    });

    describe('when no comment is returned by the api', () => {
      it('returns null', async(() => {
        apiSpy.addComment.and.returnValue(Observable.of({ text: () => { } }));

        service
          .add(new Comment())
          .subscribe(result => expect(result).toEqual(null as Comment));
      }));
    });

    describe('when an empty comment is returned by the api', () => {
      it('returns the empty comment', async(() => {
        const comment = new Comment();

        apiSpy.addComment.and.returnValue(
          Observable.of({
            text: () => 'notNull',
            json: () => comment
          })
        );

        service.add(comment).subscribe(result => {
          expect(result).toEqual(comment);
        });
      }));
    });

    describe('when the comment contains all required fields', () => {
      it('calls addComment and returns a Comment', async(() => {
        const comment = new Comment({
          _id: '3',
          _addedBy: 'addedby',
          _commentPeriod: '123',
          commentNumber: '2',
          comment:
            'This is a comment. With multiple sentences.\nAnd new lines.\n\nAnd symbols !@#$%^&*()_+{}:";\',.<>.',
          commentAuthor: { _userId: '88' },
          review: {
            _reviewerId: '99',
            reviewerNotes: 'This is a reviewer note\nWith 2 lines.'
          },
          dateAdded: new Date(),
          commentStatus: 'status',
          documents: [new Document({ _id: '77' })]
        });

        let modifiedComment;
        // Replace ApiService.addComment with a fake method that simply returns the arg passed to it.
        apiSpy.addComment.and.callFake((arg: Comment) => {
          modifiedComment = arg;
          return Observable.of({
            text: () => 'notNull',
            json: () => arg
          });
        });

        service.add(comment).subscribe(result => {
          expect(result).toEqual(jasmine.any(Comment));

          expect(modifiedComment._id).toBeUndefined();
          expect(modifiedComment.documents).toBeUndefined();

          // expect(modifiedComment.comment).toEqual(
          //   comment.comment.replace(/\n/g, '\\n')
          // );
          // expect(modifiedComment.review.reviewerNotes).toEqual(
          //   comment.review.reviewerNotes.replace(/\n/g, '\\n')
          // );
        });
      }));
    });
  });
});
