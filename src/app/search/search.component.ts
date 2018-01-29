import { Router, ActivatedRoute, Params } from '@angular/router';
import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import * as _ from 'lodash';

import { ApiService } from 'app/services/api';
import { Application } from 'app/models/application';
import { Search, SearchTerms } from 'app/models/search';
import { Proponent } from 'app/models/proponent';
import { ApplicationService } from 'app/services/application.service';
import { DocumentService } from 'app/services/document.service';
import { ProponentService } from 'app/services/proponent.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('visibility', [
      transition(':enter', [   // :enter is alias to 'void => *'
        animate('0.2s 0s', style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate('0.2s 0.75s', style({ opacity: 0 }))
      ])
    ])
  ]
})

export class SearchComponent implements OnInit {
  results: Search[];
  page: number;
  limit: number;
  count: number;
  noMoreResults: boolean;
  ranSearch: boolean;
  applications: Array<Application>;
  proponents: Array<Proponent>;
  applicationArray: Array<string>;
  protoSearchActive: boolean;
  showAdvancedFields: boolean;
  public loading: boolean;

  params: Params;
  terms: SearchTerms;

  myApplications: Array<any>;

  constructor(
    calender: NgbCalendar,
    private documentService: DocumentService,
    private applicationService: ApplicationService,
    private proponentService: ProponentService,
    private _changeDetectionRef: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService
  ) {
    this.limit = 15;
  }

  ngOnInit() {
    // this.noMoreResults      = true;
    // this.ranSearch          = false;
    // this.showAdvancedFields = false;
    // this.loading            = false;

    // this.route.params.subscribe((params: Params) => {
    //   /*
    //     TBD: Deal with meta search terms?
    //       this.params.type
    //       this.params.page
    //       this.params.limit
    //   */
    //   this.params = params;
    //   this.terms  = new SearchTerms();

    //   // Get the proponents
    //   this.proponentService.getAll().subscribe(
    //     proponents => {
    //       this.proponents = proponents;

    //       // Grab any terms that were passed in through the URL
    //       if (this.params.proponents) {
    //         const operatorIds = this.params.proponents.split(',');
    //         this.terms.proponents = this.proponents.filter(proponent => operatorIds.indexOf(proponent._id) !== -1);
    //         this.showAdvancedFields = true;
    //       }

    //       if (this.params.ownerships) {
    //         const ownerIds = this.params.ownerships.split(',');
    //         this.terms.ownerships = this.proponents.filter(proponent => ownerIds.indexOf(proponent._id) !== -1);
    //         this.showAdvancedFields = true;
    //       }

    //       // Needed in development mode - not required in prod.
    //       this._changeDetectionRef.detectChanges();

    //       // Get the applications
    //       this.applicationService.getAll().subscribe(
    //         applications => {
    //           this.applications = applications;
    //           this.applicationArray = [];
    //           this.applications.forEach((application, index) => {
    //             this.applicationArray.push(application._id);
    //           });

    //           // Grab any terms that were passed in through the URL
    //           if (this.params.applications) {
    //             const applicationIds = this.params.applications.split(',');
    //             this.terms.applications = this.applications.filter(application => applicationIds.indexOf(application._id) !== -1);
    //             this.showAdvancedFields = true;
    //           }

    //           if (this.params.keywords) {
    //             this.terms.keywords = this.params.keywords.split(',').join(' ');
    //           }

    //           if (this.params.datestart && Date.parse(this.params.datestart)) {
    //             const dateStart = new Date(this.params.datestart);
    //             this.terms.dateStart = {
    //               day: dateStart.getUTCDate(),
    //               month: dateStart.getUTCMonth() + 1,
    //               year: dateStart.getUTCFullYear()
    //             };
    //             this.showAdvancedFields = true;
    //           }

    //           if (this.params.dateend && Date.parse(this.params.dateend)) {
    //             const dateEnd = new Date(this.params.dateend);
    //             this.terms.dateEnd = {
    //               day: dateEnd.getUTCDate(),
    //               month: dateEnd.getUTCMonth() + 1,
    //               year: dateEnd.getUTCFullYear()
    //             };
    //             this.showAdvancedFields = true;
    //           }

    //           // Needed in development mode - not required in prod.
    //           this._changeDetectionRef.detectChanges();

    //           if (!_.isEmpty(this.terms.getParams())) {
    //             this.doSearch(true);
    //           }
    //         },
    //         error => console.log(error)
    //       );
    //     },
    //     error => console.log(error)
    //   );
    // });
  }

  toggleAdvancedSearch() {
    this.showAdvancedFields = !this.showAdvancedFields;
  }

  doSearch(firstSearch: boolean) {
    this.loading = true;
    this.ranSearch = true;

    if (firstSearch) {
      this.page = 0;
      this.count = 0;
      this.results = [];
      this.noMoreResults = false;
    } else {
      this.page += 1;
    }

    this.documentService.get(this.terms, this.applications, this.proponents, this.page, this.limit).subscribe(
      data => {
        this.loading = false;

        // Push in 1st call
        if (data[0].results) {
          data[0].results.forEach(i => {
            this.results.push(i);
          });
        }

        // Push in 2nd call
        if (data[1].results) {
          data[1].results.forEach(i => {
            this.results.push(i);
          });
        }

        this.count = (data[0].count || 0) + (data[1].count || 0);

        this.noMoreResults = (this.results.length === this.count) || (data[0].results.length === 0 && data[1].results.length === 0);

        // Needed in development mode - not required in prod.
        this._changeDetectionRef.detectChanges();
      },
      error => console.log(error)
    );
  }

  onSubmit() {
    this.router.navigate(['search', this.terms.getParams()]);
  }

  loadMore() {
    this.doSearch(false);
  }
}
