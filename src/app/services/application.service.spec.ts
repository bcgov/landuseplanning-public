import { TestBed, inject } from '@angular/core/testing';
import { ApplicationService } from './application.service';
import { ApiService } from 'app/services/api';
import { DocumentService } from './document.service';
import { CommentPeriodService } from './commentperiod.service';
import { DecisionService } from './decision.service';
import { FeatureService } from './feature.service';
import { of } from 'rxjs';
import { Application } from 'app/models/application';
import { Document } from 'app/models/document';
import { CommentPeriod } from 'app/models/commentperiod';
import { Decision } from 'app/models/decision';
import { Feature } from 'app/models/feature';

fdescribe('ApplicationService', () => {
  let service;
  const apiServiceStub = {
    getApplication(id: string) {
      const response = {
        text() {
          return [{_id: id, status: 'ACCEPTED'}];
        }
      };
      return of(response);
    },

    getApplications() {
      const response = {
        text() {
          return [
            {_id: 'AAAA', status: 'ACCEPTED'},
            {_id: 'BBBB', status: 'OFFERED'}
          ];
        }
      };
      return of(response);
    },

    getCountApplications() {
      const response = {
        headers: {
          get(name: string) {
            if (name === 'x-total-count') {
              return 300;
            } else {
              return null;
            }
          }
        }
      };
      return of(response);
    },

    handleError(error: any) {
      fail(error);
    }
  };

  const documentServiceStub = {
    getAllByApplicationId(applicationId: string) {
      const documents = [
        new Document({_id: 'DDDDD'}),
        new Document({_id: 'EEEEE'})
      ];
      return of(documents);
    }
  };

  const commentPeriodServiceStub = {
    getAllByApplicationId(applicationId: string) {
      const commentPeriods = [
        new CommentPeriod({_id: 'DDDDD', startDate: new Date(2018, 10, 1, ), endDate: new Date(2018, 11, 10)}),
        new CommentPeriod({_id: 'EEEEE', startDate: new Date(2018, 10, 1, ), endDate: new Date(2018, 11, 10)})
      ];
      return of(commentPeriods);
    },

    getCurrent(periods: CommentPeriod[]): CommentPeriod {
      return (periods.length > 0) ? periods[0] : null;
    },

    getStatusCode(commentPeriod: CommentPeriod): string {
      return 'OP';
    },

    getStatusString(statusCode: string): string {
      return 'Commenting Open';
    }
  };

  const decisionServiceStub = {
    getByApplicationId(applicationId: string) {
      return of(new Decision({_id: 'IIIII'}));
    }
  };

  const featureServiceStub = {
    getByApplicationId(applicationId: string) {
      const features = [
        new Feature({id: 'FFFFF', properties: { TENURE_AREA_IN_HECTARES: 12 }}),
        new Feature({id: 'GGGGG', properties: { TENURE_AREA_IN_HECTARES: 13 }})
      ];
      return of(features);
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApplicationService,
        { provide: ApiService, useValue: apiServiceStub },
        { provide: DocumentService, useValue: documentServiceStub },
        { provide: CommentPeriodService, useValue: commentPeriodServiceStub },
        { provide: DecisionService, useValue: decisionServiceStub },
        { provide: FeatureService, useValue: featureServiceStub },
      ]
    });

    service = TestBed.get(ApplicationService);
  });

  it('should be created', inject([ApplicationService], (appService: ApplicationService) => {
    expect(appService).toBeTruthy();
  }));

  describe('getCount()', () => {
    it('retrieves the x-total-count header', () => {
      service.getCount().subscribe(number => {
        expect(number).toEqual(300);
      });
    });
  });

  describe('getAll()', () => {
    let apiService;
    const existingApplicationsData = [
      {
        _id: 'AAAA', status: 'ACCEPTED', description: 'Wonderful application',
        cl_file: null, businessUnit: null
      },
      {
        _id: 'BBBB', status: 'ABANDONED', description: 'Terrible application',
        cl_file: null, businessUnit: null
      },
    ];

    beforeEach(() => {
      apiService = TestBed.get(ApiService);

      const response = {
        text() {
          return existingApplicationsData;
        },
        json() {
          return existingApplicationsData;
        }
      };

      spyOn(apiService, 'getApplications')
        .and.returnValue(of(response));
    });

    describe('with no filters', () => {
      it('returns the applications', () => {
        service.getAll().subscribe(applications => {
          expect(applications[0]._id).toEqual('AAAA');
          expect(applications[1]._id).toEqual('BBBB');
        });
      });
    });

    describe('with region filters', () => {
      xit('calls the api.getApplications method with the region filters', () => {
        service.getAll(1, 100, {});
      });
    });
  });

  describe('getById()', () => {
    let apiService;
    const freshApplicationData = {
      _id: 'AAAA', status: 'ACCEPTED', description: 'Hot new application',
      cl_file: null, businessUnit: null
    };

    beforeEach(() => {
      apiService = TestBed.get(ApiService);

      const response = {
        text() {
          return [freshApplicationData];
        },
        json() {
          return [freshApplicationData];
        }
      };

      spyOn(apiService, 'getApplication')
        .and.returnValue(of(response));
    });

    describe('when an application has been cached', () => {
      const cachedApplication = new Application({_id: 'AAAA', description: 'Old outdated application'});
      beforeEach(() => {
        service.application = cachedApplication;
      });

      describe('and forceReload is false', () => {
        it('returns the cached application', () => {
          service.getById('AAAA', false).subscribe(application => {
            expect(application._id).toEqual('AAAA');
            expect(application.description).toEqual('Old outdated application');
          });
        });
      });

      describe('and forceReload is true', () => {
        it('calls the api for an application', () => {
          service.getById('AAAA', true).subscribe(application => {
            expect(application._id).toEqual('AAAA');
            expect(application.description).toEqual('Hot new application');
          });
        });
      });
    });

    describe('when no application has been cached', () => {
      beforeEach(() => {
        service.application = null;
      });

      it('calls the api for an application', () => {
        service.getById('AAAA', false).subscribe(application => {
          expect(application._id).toEqual('AAAA');
          expect(application.description).toEqual('Hot new application');
        });
      });

      describe('application properties', () => {
        it('sets the appStatus property', () => {
          freshApplicationData.status = 'ACCEPTED';
          service.getById('AAAA').subscribe( application => {
            expect(application.appStatus).toBe('Application Under Review');
          });
        });

        it('clFile property is padded to be seven digits', () => {
          freshApplicationData.cl_file = 7777;
          service.getById('AAAA').subscribe( application => {
            expect(application.clFile).toBe('0007777');
          });
        });

        it('clFile property is null if there is no cl_file property', () => {
          freshApplicationData.cl_file = null;
          service.getById('AAAA').subscribe( application => {
            expect(application.clFile).toBeUndefined();
          });
        });

        it('sets the region property', () => {
          freshApplicationData.businessUnit = 'ZOO Keeper';
          service.getById('AAAA').subscribe( application => {
            expect(application.region).toBeDefined();
            expect(application.region).toEqual('ZOO');
          });
        });
      });

      it('sets the documents to the result of the document service', () => {
        service.getById('AAAA').subscribe( application => {
          expect(application.documents).toBeDefined();
          expect(application.documents).not.toBeNull();
          expect(application.documents[0]._id).toBe('DDDDD');
          expect(application.documents[1]._id).toBe('EEEEE');
        });
      });

      it('gets the commentPeriods for the application, sets the current period and cpStatus ', () => {
        service.getById('AAAA').subscribe( application => {
          expect(application.currentPeriod).toBeDefined();
          expect(application.currentPeriod).not.toBeNull();
          expect(application.currentPeriod._id).toBe('DDDDD');
        });
      });

      it('sets the commentPeriod status', () => {
        service.getById('AAAA').subscribe( application => {
          expect(application.cpStatus).toEqual('Commenting Open');
        });
      });

      it('sets the decisions to the result of the decisionService', () => {
        service.getById('AAAA').subscribe( application => {
          expect(application.decision).toBeDefined();
          expect(application.decision).not.toBeNull();
          expect(application.decision._id).toBe('IIIII');
        });
      });

      it('sets the features to the result of the featureService', () => {
        service.getById('AAAA').subscribe( application => {
          expect(application.features).toBeDefined();
          expect(application.features).not.toBeNull();
          expect(application.features[0].id).toBe('FFFFF');
          expect(application.features[1].id).toBe('GGGGG');
        });
      });
    });
  });

  describe('getStatusCode()', () => {
    it('with "ABANDONED" status it returns "AB" code', () => {
      expect(service.getStatusCode('ABANDONED')).toEqual(service.ABANDONED);
    });

    it('with "CANCELLED" status it returns "AB" code', () => {
      expect(service.getStatusCode('CANCELLED')).toEqual(service.ABANDONED);
    });

    it('with "OFFER NOT ACCEPTED" status it returns "AB" code', () => {
      expect(service.getStatusCode('OFFER NOT ACCEPTED')).toEqual(service.ABANDONED);
    });

    it('with "OFFER RESCINDED" status it returns "AB" code', () => {
      expect(service.getStatusCode('OFFER RESCINDED')).toEqual(service.ABANDONED);
    });

    it('with "RETURNED" status it returns "AB" code', () => {
      expect(service.getStatusCode('RETURNED')).toEqual(service.ABANDONED);
    });

    it('with "REVERTED" status it returns "AB" code', () => {
      expect(service.getStatusCode('REVERTED')).toEqual(service.ABANDONED);
    });

    it('with "SOLD" status it returns "AB" code', () => {
      expect(service.getStatusCode('SOLD')).toEqual(service.ABANDONED);
    });

    it('with "SUSPENDED" status it returns "AB" code', () => {
      expect(service.getStatusCode('SUSPENDED')).toEqual(service.ABANDONED);
    });

    it('with "WITHDRAWN" status it returns "AB" code', () => {
      expect(service.getStatusCode('WITHDRAWN')).toEqual(service.ABANDONED);
    });

    it('with "ACCEPTED" status it returns "AUR" code', () => {
      expect(service.getStatusCode('ACCEPTED')).toEqual(service.APPLICATION_UNDER_REVIEW);
    });

    it('with "ALLOWED" status it returns "AUR" code', () => {
      expect(service.getStatusCode('ALLOWED')).toEqual(service.APPLICATION_UNDER_REVIEW);
    });

    it('with "PENDING" status it returns "AUR" code', () => {
      expect(service.getStatusCode('PENDING')).toEqual(service.APPLICATION_UNDER_REVIEW);
    });

    it('with "RECEIVED" status it returns "AUR" code', () => {
      expect(service.getStatusCode('RECEIVED')).toEqual(service.APPLICATION_UNDER_REVIEW);
    });

    it('with "OFFER ACCEPTED" status it returns "ARC" code', () => {
      expect(service.getStatusCode('OFFER ACCEPTED')).toEqual(service.APPLICATION_REVIEW_COMPLETE);
    });

    it('with "OFFERED" status it returns "ARC" code', () => {
      expect(service.getStatusCode('OFFERED')).toEqual(service.APPLICATION_REVIEW_COMPLETE);
    });

    it('with "ACTIVE" status it returns "DA" code', () => {
      expect(service.getStatusCode('ACTIVE')).toEqual(service.DECISION_APPROVED);
    });

    it('with "COMPLETED" status it returns "DA" code', () => {
      expect(service.getStatusCode('COMPLETED')).toEqual(service.DECISION_APPROVED);
    });

    it('with "DISPOSITION IN GOOD STANDING" status it returns "DA" code', () => {
      expect(service.getStatusCode('DISPOSITION IN GOOD STANDING')).toEqual(service.DECISION_APPROVED);
    });

    it('with "EXPIRED" status it returns "DA" code', () => {
      expect(service.getStatusCode('EXPIRED')).toEqual(service.DECISION_APPROVED);
    });

    it('with "HISTORIC" status it returns "DA" code', () => {
      expect(service.getStatusCode('HISTORIC')).toEqual(service.DECISION_APPROVED);
    });

    it('with "DISALLOWED" status it returns "DNA" code', () => {
      expect(service.getStatusCode('DISALLOWED')).toEqual(service.DECISION_NOT_APPROVED);
    });

    it('with "NOT USED" status it returns "UN" code', () => {
      expect(service.getStatusCode('NOT USED')).toEqual(service.UNKNOWN);
    });

    it('with "PRE-TANTALIS" status it returns "UN" code', () => {
      expect(service.getStatusCode('PRE-TANTALIS')).toEqual(service.UNKNOWN);
    });

    it('returns "UN" if no status passed', () => {
      expect(service.getStatusCode('')).toEqual(service.UNKNOWN);
    });

    it('returns "UN" if the passed in status is undefined', () => {
      expect(service.getStatusCode(undefined)).toEqual(service.UNKNOWN);
    });

    it('returns "UN" if the passed in status is null', () => {
      expect(service.getStatusCode(null)).toEqual(service.UNKNOWN);
    });
  });

  describe('getTantalisStatus()', () => {
    it('with "AB" status it returns Abandoned codes', () => {
      expect(service.getTantalisStatus(service.ABANDONED)).toEqual(
        ['ABANDONED', 'CANCELLED', 'OFFER NOT ACCEPTED', 'OFFER RESCINDED', 'RETURNED', 'REVERTED', 'SOLD', 'SUSPENDED', 'WITHDRAWN']
      );
    });

    it('with "AUR" status it returns Application Under Review codes', () => {
      expect(service.getTantalisStatus(service.APPLICATION_UNDER_REVIEW)).toEqual(
        ['ACCEPTED', 'ALLOWED', 'PENDING', 'RECEIVED']
      );
    });

    it('with "ARC" status it returns Application Review Complete codes', () => {
      expect(service.getTantalisStatus(service.APPLICATION_REVIEW_COMPLETE)).toEqual(
        ['OFFER ACCEPTED', 'OFFERED']
      );
    });

    it('with "DA" status it returns Decision Approved codes', () => {
      expect(service.getTantalisStatus(service.DECISION_APPROVED)).toEqual(
        ['ACTIVE', 'COMPLETED', 'DISPOSITION IN GOOD STANDING', 'EXPIRED', 'HISTORIC']
      );
    });

    it('with "DNA" status it returns Decision Not Approved codes', () => {
      expect(service.getTantalisStatus(service.DECISION_NOT_APPROVED)).toEqual(
        ['DISALLOWED']
      );
    });
  });

  describe('getShortStatusString()', () => {
    it('with "AB" code it returns "Abandoned" string', () => {
      expect(service.getShortStatusString(service.ABANDONED)).toBe('Abandoned');
    });

    it('with "AUR" code it returns "Under Review" string', () => {
      expect(service.getShortStatusString(service.APPLICATION_UNDER_REVIEW)).toBe('Under Review');
    });

    it('with "ARC" code it returns "Decision Pending" string', () => {
      expect(service.getShortStatusString(service.APPLICATION_REVIEW_COMPLETE)).toBe('Decision Pending');
    });

    it('with "DA" code it returns "Approved" string', () => {
      expect(service.getShortStatusString(service.DECISION_APPROVED)).toBe('Approved');
    });

    it('with "DNA" code it returns "Not Approved" string', () => {
      expect(service.getShortStatusString(service.DECISION_NOT_APPROVED)).toBe('Not Approved');
    });

    it('with "UN" code it returns "Unknown" string', () => {
      expect(service.getShortStatusString(service.UNKNOWN)).toBe('Unknown');
    });
  });

  describe('getLongStatusString()', () => {
    it('with "AB" code it returns "Abandoned" string', () => {
      expect(service.getLongStatusString(service.ABANDONED)).toBe('Abandoned');
    });

    it('with "AUR" code it returns "Application Under Review" string', () => {
      expect(service.getLongStatusString(service.APPLICATION_UNDER_REVIEW)).toBe('Application Under Review');
    });

    it('with "ARC" code it returns "Application Review Complete - Decision Pending" string', () => {
      expect(service.getLongStatusString(service.APPLICATION_REVIEW_COMPLETE)).toBe('Application Review Complete - Decision Pending');
    });

    it('with "DA" code it returns "Decision: Approved - Tenure Issued" string', () => {
      expect(service.getLongStatusString(service.DECISION_APPROVED)).toBe('Decision: Approved - Tenure Issued');
    });

    it('with "DNA" code it returns "Decision: Not Approved" string', () => {
      expect(service.getLongStatusString(service.DECISION_NOT_APPROVED)).toBe('Decision: Not Approved');
    });

    it('with "UN" code it returns "Unknown status" string', () => {
      expect(service.getLongStatusString(service.UNKNOWN)).toBe('Unknown Status');
    });
  });

  describe('getRegionCode()', () => {
    it('returns the two letter abbreviation in the Business Unit string', () => {
      const businessUnit = 'SK - LAND MGMNT - SKEENA FIELD OFFICE';
      expect(service.getRegionCode(businessUnit)).toBe('SK');
    });

    it('returns Undefined if no Business Unit is present', () => {
      expect(service.getRegionCode()).toBeUndefined();
    });
  });

  describe('isDecision()', () => {
    it('returns false for the non-decision statuses', () => {
      ['AB', 'AC', 'DE', 'SU', 'UN'].map(status => {
        expect(service.isDecision(status)).toBe(false);
      });
    });

    it('returns true for the decision statuses', () => {
      ['AL', 'CA', 'DI', 'DG', 'OA', 'ON', 'OF'].map(status => {
        expect(service.isDecision(status)).toBe(true);
      });
    });
  });

  describe('getRegionString()', () => {
    it('with "CA" code it returns "Cariboo, Williams Lake"', () => {
      expect(service.getRegionString('CA')).toBe('Cariboo, Williams Lake');
    });

    it('with "KO" code it returns "Kootenay, Cranbrook"', () => {
      expect(service.getRegionString('KO')).toBe('Kootenay, Cranbrook');
    });

    it('with "LM" code it returns "Lower Mainland, Surrey"', () => {
      expect(service.getRegionString('LM')).toBe('Lower Mainland, Surrey');
    });

    it('with "OM" code it returns "Omenica/Peace, Prince George"', () => {
      expect(service.getRegionString('OM')).toBe('Omenica/Peace, Prince George');
    });

    it('with "PE" code it returns "Peace, Ft. St. John"', () => {
      expect(service.getRegionString('PE')).toBe('Peace, Ft. St. John');
    });

    it('with "SK" code it returns "Skeena, Smithers"', () => {
      expect(service.getRegionString('SK')).toBe('Skeena, Smithers');
    });

    it('with "SI" code it returns "Thompson Okanagan, Kamloops"', () => {
      expect(service.getRegionString('SI')).toBe('Thompson Okanagan, Kamloops');
    });

    it('with "VI" code it returns "West Coast, Nanaimo"', () => {
      expect(service.getRegionString('VI')).toBe('West Coast, Nanaimo');
    });

    it('returns Null if no code passed', () => {
      expect(service.getRegionString('')).toBeNull();
    });

    it('returns Null if code is not recognized', () => {
      expect(service.getRegionString('WTF')).toBeNull();
    });

    it('returns Null if code is undefined', () => {
      expect(service.getRegionString(undefined)).toBeNull();
    });

    it('returns Null if code is null', () => {
      expect(service.getRegionString(null)).toBeNull();
    });
  });
});
