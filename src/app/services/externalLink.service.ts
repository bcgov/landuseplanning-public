import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api';
import { ExternalLink } from 'app/models/externalLink';

@Injectable()
export class ExternalLinkService {
  constructor(private api: ApiService) { }

  /**
   * Get multiple external links by their ids.
   *
   * @param {Array} ids The document IDs to get with.
   * @returns {Observable}
   */
  getByMultiId(ids: Array<String>): Observable<Array<Document>> {
    return this.api.getExternalLinksByMultiId(ids)
      .map(res => {
        if (res && res.length > 0) {
          let exLinks = [];
          res.forEach(exl => {
            exLinks.push(new ExternalLink(exl));
          });
          return exLinks;
        }
        return null;
      })
      .catch(error => this.api.handleError(error));
  }
}
