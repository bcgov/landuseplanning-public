import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, zip } from 'rxjs';
import { partition, groupBy, mapValues, keyBy } from 'lodash';

import { Document } from 'app/models/document';
import { SearchTerms } from 'app/models/search';

import { ApiService } from 'app/services/api';
import { SearchService } from 'app/services/search.service';
import { StorageService } from 'app/services/storage.service';

import { DocumentTableRowsComponent } from './project-document-table-rows/project-document-table-rows.component';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { Utils } from 'app/shared/utils/utils';
import { DocumentSection } from 'app/models/documentSection';
import { DocumentSectionService } from 'app/services/documentSection.service';

const encode = encodeURIComponent;
window['encodeURIComponent'] = (component: string) => {
  return encode(component).replace(/[!'()*]/g, (c) => {
    // Also encode !, ', (, ), and *
    return '%' + c.charCodeAt(0).toString(16);
  });
};

@Component({
  selector: 'app-documents',
  templateUrl: './documents-tab.component.html',
  styleUrls: ['./documents-tab.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DocumentsTabComponent implements OnInit, OnDestroy {
  public terms = new SearchTerms();
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public documents: Document[] = null;
  public loading = true;
  public documentSections: DocumentSection[] = [];
  public documentsGroupedBySection: Document[][] = [];

  public documentTableData: TableObject;
  public documentTableColumns: any[] = [
    {
      name: 'Document',
      value: 'displayName',
      width: 'col-7'
    },
    {
      name: 'Project Phase',
      value: 'projectPhase',
      width: 'col-3'
    },
    {
      name: 'Date',
      value: 'datePosted',
      width: 'col-2'
    }
  ];

  public selectedCount = 0;
  public currentProject;
  public tableParams: TableParamsObject = new TableParamsObject();

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private storageService: StorageService,
    private tableTemplateUtils: TableTemplateUtils,
    private utils: Utils,
    private documentSectionService: DocumentSectionService
  ) { }

  ngOnInit() {
    // get data from route resolver
    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
      });

    this.currentProject = this.storageService.state.currentProject.data;

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res && res?.documents && res?.documents.length > 0) {
          // As with the rest of the app, "file" and "document" are used interchangeably.
          this.tableParams.totalListItems = 0;
          const documentsAndSections = res.documents[0];

          // Ensure the sections arranged by their "order" key.
          this.documentSections = this.sortSectionsByOrder(res.documents[1]);

          if (documentsAndSections.length > 0) {
            // Set the documents for the table and total list items.
            this.documents = documentsAndSections[0].data.searchResults;

            if (documentsAndSections[0].data.meta.length > 0) {
              this.tableParams.totalListItems = documentsAndSections[0].data.meta[0].searchResultsTotal;
            }

            if (this.documentSections.length > 0) {
              this.groupAndSortFilesWithinSections();
            }
          }

          this.loading = false;
          this.setDocumentRowData();
          this._changeDetectionRef.detectChanges();
        } else {
          alert('Uh-oh, couldn\'t load documents.');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
          this.loading = false;
        }
      }
      );
  }

  /**
   * Groups files together within their sections, then sorts the sections.
   */
  groupAndSortFilesWithinSections(): void {
    // Get a map of section IDs to their names.
    const sectionIdsToNames = mapValues(keyBy(this.documentSections, '_id'), 'name');

    /*
    * If there are document/file sections, partition the list of
    * files into those that are sectioned and those that aren't.
    * */
    const [filesWithSections, unorganizedFiles] = partition(
      this.documents,
      (document) => document.section && Object.keys(sectionIdsToNames).includes(document.section)
    );

    // Set documents in the "main" table to be docs without sections.
    this.documents = unorganizedFiles;
    // Update "main" table docs count.
    this.tableParams.totalListItems = unorganizedFiles.length;

    // Have each file use the section name rather than ID.
    filesWithSections.forEach(file => {
      file.section = sectionIdsToNames[file.section];
    })

    // Group files together with by section.
    const unorderedDocumentGroupings = groupBy(filesWithSections, 'section');

    // Convert grouped files object to array to ensure correct section order is used.
    Object.values(sectionIdsToNames).forEach((section) => {
      this.documentsGroupedBySection.push(unorderedDocumentGroupings[section]);
    })

    // Filter out sections with no files in them.
    this.documentsGroupedBySection = this.documentsGroupedBySection.filter((document) => {
      return Array.isArray(document);
    })
  }

  /**
   * Takes a date string and formats it as month, day, year. For example, December 31, 2000.
   *
   * @param dateString The date string to format.
   * @returns The formatted date.
   */
  formatDocumentDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-us', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /**
   * When a document in the table is clicked, encode its public URL so it can be served
   * by the server, then navigate the user to a new tab with that document.
   *
   * @param item The document to form the URL for.
   */
  goToItem(item: Document): void {
    const filename = item.documentFileName;
    let safeName = filename;

    try {
      safeName = encode(filename).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\\/g, '_').replace(/\//g, '_').replace(/\%2F/g, '_');
    } catch (e) {
      console.log('Error, couldn\'t form the URL:', e);
    }

    window.open('/api/document/' + item._id + '/fetch/' + safeName, '_blank');
  }

  /**
   * Split the document sections into those that have an explicit "order"
   * property declared, and those that don't. Of those that do, sort those by
   * numerical order value. Finally, concatenate those with "null" as their order
   * to the bottom of the list of document sections.
   *
   * It's important that this sorting method matches what is used on the backend
   * app for file sections.
   *
   * @param documentSections An array of document sections to sort.
   * @returns The sorted array of sections.
   */
    sortSectionsByOrder(documentSections: DocumentSection[]): DocumentSection[]  {
      const [populatedEntries, nullEntires] = partition(
        documentSections,
        (section) => Number.isInteger(section.order)
      );
      if (populatedEntries.length > 0) {
        // Sort by the order property.
        populatedEntries.sort((a, b) => a.order - b.order);
      }
      return populatedEntries.concat(nullEntires);
    }

  navSearchHelp() {
    this.router.navigate(['/search-help']);
  }

  public selectAction(action) {
    // select all documents
    switch (action) {
      case 'copyLink':
        this.documentTableData.data.map((item) => {
          if (item.checkbox === true) {
            let selBox = document.createElement('textarea');
            selBox.style.position = 'fixed';
            selBox.style.left = '0';
            selBox.style.top = '0';
            selBox.style.opacity = '0';
            selBox.value = window.location.href.split(';')[0] + `/detail/${item._id}`;
            document.body.appendChild(selBox);
            selBox.focus();
            selBox.select();
            document.execCommand('copy');
            document.body.removeChild(selBox);
          }
        });
        break;
      case 'selectAll':
        let someSelected = false;
        this.documentTableData.data.map((item) => {
          if (item.checkbox === true) {
            someSelected = true;
          }
        });
        this.documentTableData.data.map((item) => {
          item.checkbox = !someSelected;
        });

        this.selectedCount = someSelected ? 0 : this.documentTableData.data.length;
        this._changeDetectionRef.detectChanges();
        break;
      case 'download':
        let promises = [];
        this.documentTableData.data.map((item) => {
          if (item.checkbox === true) {
            promises.push(this.api.downloadDocument(this.documents.filter(d => d._id === item._id)[0]));
          }
        });
        return Promise.all(promises).then(() => {
          console.log('Download initiated for file(s)');
        });
    }
  }

  setDocumentRowData() {
    let documentList = [];
    if (this.documents && this.documents.length > 0) {
      this.documents.forEach(document => {
        documentList.push(
          {
            documentFileName: document.documentFileName || document.displayName || document.internalOriginalName,
            displayName: document.displayName,
            datePosted: document.datePosted,
            description: document.description,
            size: this.utils.formatBytes(document.internalSize),
            ext: document.internalExt.toUpperCase(),
            projectPhase: document.projectPhase,
            type: document.type,
            milestone: document.milestone,
            _id: document._id,
            project: document.project
          }
        );
      });
      this.documentTableData = new TableObject(
        DocumentTableRowsComponent,
        documentList,
        this.tableParams
      );
    }
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedDocs(this.tableParams.currentPage);
  }

  isEnabled(button) {
    switch (button) {
      case 'copyLink':
        return this.selectedCount === 1;
      default:
        return this.selectedCount > 0;
    }
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  getPaginatedDocs(pageNumber) {
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);
    zip(
      this.searchService.getSearchResults(
        this.tableParams.keywords,
        'Document',
        [{ 'name': 'project', 'value': this.currentProject._id }],
        pageNumber,
        this.tableParams.pageSize,
        this.tableParams.sortBy,
        { documentSource: 'PROJECT', internalExt: 'doc,docx,xls,xlsx,ppt,pptx,pdf,txt' },
        true),
        this.documentSectionService.getAll(this.currentProject._id)
    )
    .takeUntil(this.ngUnsubscribe)
    .subscribe((res: any) => {
      if (res && res?.length > 0) {
        this.documentsGroupedBySection = [];
        // As with the rest of the app, "file" and "document" are used interchangeably.
        this.tableParams.totalListItems = 0;
        const documentsAndSections = res[0];

        // Ensure the sections arranged by their "order" key.
        this.documentSections = this.sortSectionsByOrder(res[1]);

        if (documentsAndSections.length > 0) {
          // Set the documents for the table and total list items.
          this.documents = documentsAndSections[0].data.searchResults;
          this.tableParams.totalListItems = documentsAndSections[0].data.meta[0].searchResultsTotal;

          if (this.documentSections.length > 0) {
            this.groupAndSortFilesWithinSections();
          }
        }

        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
        this.setDocumentRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      } else {
        alert('Uh-oh, couldn\'t load documents.');
        console.error('Error. Couldn\'t load documents.', res)
        // project not found --> navigate back to search
        this.router.navigate(['/search']);
        this.loading = false;
      }
    });
  }

  public onNumItems(numItems) {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = 1;
    params['sortBy'] = this.tableParams.sortBy;
    params['keywords'] = this.tableParams.keywords;
    numItems === 'max' ? params['pageSize'] = this.tableParams.pageSize = this.tableParams.totalListItems : params['pageSize'] = this.tableParams.pageSize = numItems;

    this.router.navigate(['p', this.currentProject._id, 'documents', params]);
  }

  public onSubmit() {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = 1;
    params['sortBy'] = this.tableParams.sortBy = '';
    params['keywords'] = this.tableParams.keywords;
    params['pageSize'] = this.tableParams.pageSize = 10;

    this.router.navigate(['p', this.currentProject._id, 'documents', params]);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
