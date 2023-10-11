import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { DocumentSection } from 'app/models/documentSection';

@Injectable()
export class DocumentSectionService {
  constructor(private api: ApiService) {}

  /**
   * Get all document sections on a single project. Get the raw response data and return it
   * as DocumentSections objects.
   *
   * @param {string} currentProjectId The project to get sections for.
   * @returns {Observable}
   */
    public getAll(currentProjectId: string): Observable<DocumentSection[]> {
      let documentSections = [];
      return this.api.getDocumentSections(currentProjectId)
        .map((res: DocumentSection[]) => {
          if (res) {
            res.forEach(section => documentSections.push(new DocumentSection(section)));
          }
          return documentSections;
        })
        .catch(error => this.api.handleError(error));
    }
}
