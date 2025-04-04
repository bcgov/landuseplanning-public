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
  public documents = null;
	public documentVault = null;
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
      value: 'dateAdded',
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
    this.currentProject = this.storageService.state.currentProject.data;
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res?.documents?.length > 0) {
          // As with the rest of the app, "file" and "document" are used interchangeably.
          this.tableParams.totalListItems = 0;

          // Ensure the sections arranged by their "order" key.
          this.documentSections = this.sortSectionsByOrder(res.documents[1]);

          if (res.documents[0].length > 0 || res.documents[2].length > 0 ) {
            // Set the documents for the table and total list items.
            const combinedResults = [...res.documents[0][0]?.data?.searchResults || [], ...res.documents[2][0]?.data?.searchResults || []];
						const sortedResults = this.sortDocuments(combinedResults, this.tableParams.sortBy || '-dateAdded');
						this.documents = this.documentVault = sortedResults;
            this.updateTableDataAndParams();

            if (res.documents[0][0].data.meta.length > 0 || res.documents[2][0].data.meta.length > 0) {
              this.tableParams.totalListItems = (res.documents[0][0].data.meta[0]?.searchResultsTotal || 0) + (res.documents[2][0].data.meta[0]?.searchResultsTotal || 0);
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
        }
      }
      );
  }

  /**
   * Update the document table parameters like currentPage, pageSize, etc. If there's a
   * document assigned to a section, load 100 files. Otherwise, load 10.
   * This can be called after the document and document file sections have been loaded.
   */
  updateTableDataAndParams(): void {
    if (this.documents.find(document => document.section)) {
      this.route.params
        .takeUntil(this.ngUnsubscribe)
        .subscribe(params => {
          // Copy router params and update the page size value.
          const updatedParams = {
            ...params,
            pageSize: 100
          }
          this.tableParams = this.tableTemplateUtils.getParamsFromUrl(updatedParams);
        });
    } else {
      this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params)
      });
    }
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
			if (file.internalExt) {
				file.internalExt = file.internalExt.toUpperCase();
			}
    })

    // Group files together by section.
    const unorderedDocumentGroupings = groupBy(filesWithSections, 'section');

    // Convert grouped files object to array to ensure correct section order is used.
    Object.values(sectionIdsToNames).forEach((section) => {
      this.documentsGroupedBySection.push(unorderedDocumentGroupings[section]);
    })

    // Filter out sections with no files in them.
    this.documentsGroupedBySection = this.documentsGroupedBySection.filter((document) => {
      return Array.isArray(document);
    })

    // Sort the grouped documents.
    this.documentsGroupedBySection = this.documentsGroupedBySection.map(section => 
      section.sort((a: any, b: any) => new Date(b.dateAdded || b.datePosted).getTime() - new Date(a.dateAdded || a.datePosted).getTime())
    );
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
    this.api.openDocument(item);
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
    if (this.documents?.length > 0) {
      this.documents.forEach(document => {
        documentList.push(
          {
            documentFileName: document.documentFileName || document.displayName || document.internalOriginalName,
            displayName: document.displayName,
            datePosted: document.dateAdded || document.datePosted,
            description: document.description,
						externalLink: document.externalLink || null,
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
    this.documentVault = this.sortDocuments(this.documentVault, this.tableParams.sortBy, 'sorting');
		this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
		this.getPaginatedDocs(this.tableParams.currentPage);
  }

	public sortDocuments = (documents: any[], sort: string = '-datePosted', action: string = 'init') => {
    // Exclude documents with sections if we're reacting to a sorting action.
    if ('sorting' === action) {
      documents = documents.filter(doc => !doc.section);
    }
		const sortData = sort;
		const sortDir = '-' === Array.from(sort)[0] ? -1 : 1;
		const sortBy = sortData.substring(1);

		if ('displayName' === sortBy) {
			// If sorting strings then convert to lower case.
			documents.sort((a, b) => {
				if (a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) return -1 * sortDir;
				if (a[sortBy].toLowerCase() > b[sortBy].toLowerCase()) return 1 * sortDir;
				return 0;
			});
		} else if ('dateAdded' === sortBy) {
      // Make sure dates are sorted correctly.
      documents.sort((a: any, b: any) => sortDir * (new Date(a.dateAdded || a.datePosted).getTime() - new Date(b.dateAdded || b.datePosted).getTime()));
    } else {
			documents.sort((a, b) => {
				if (a[sortBy] < b[sortBy]) return -1 * sortDir;
				if (a[sortBy] > b[sortBy]) return 1 * sortDir;
				return 0;
			});
		}
		return documents || [];
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
		const startIndex = (pageNumber - 1) * this.tableParams.pageSize;
		const endIndex = startIndex + this.tableParams.pageSize;
		if (endIndex && 0 < this.documentVault.length) {
			this.documents = this.documentVault.slice(startIndex, endIndex);
			this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, this.tableParams.keywords || '');
			this.setDocumentRowData();
			this.loading = false;
			this._changeDetectionRef.detectChanges();
		}
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
