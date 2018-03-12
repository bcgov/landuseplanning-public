import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Feature } from 'app/models/feature';

import { ApiService } from './api';
import { Search } from 'app/models/search';

@Injectable()
export class SearchService {
  private features: Feature[] = null;

  constructor(private api: ApiService) { }

  getByCLFile(clfile: string): Observable<Search> {
    return this.api.getBCGWCrownLands(clfile)
      .map((res: Response) => {
        return res.text() ? new Search(res.json()) : null;
      });
  }

  getByDTID(dtid: string): Observable<object[]> {
    return this.api.getBCGWDispositionTransactionId(dtid)
      .map((res: Response) => {
        const results = res.text() ? new Search(res.json()) : null;
        return results.features;
      })
      .map((features: Feature[]) => {
        if (!features) { return null; }

        console.log('new features =', features);
        this.features = features;
        return this.features;
      });
  }
}
