import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { Feature } from 'app/models/feature';

@Injectable()
export class FeatureService {
  constructor(private api: ApiService) {}

  getByDTID(tantalisId: number): Observable<Feature[]> {
    return this.api.getFeaturesByTantalisId(tantalisId).pipe(
      map((res: Feature[]) => {
        if (!res || res.length === 0) {
          return [] as Feature[];
        }

        const features: Feature[] = [];
        res.forEach(feature => {
          features.push(new Feature(feature));
        });
        return features;
      }),
      catchError(this.api.handleError)
    );
  }

  getByApplicationId(applicationId: string): Observable<Feature[]> {
    return this.api.getFeaturesByApplicationId(applicationId).pipe(
      map((res: Feature[]) => {
        if (!res || res.length === 0) {
          return [] as Feature[];
        }

        const features: Feature[] = [];
        res.forEach(feature => {
          features.push(new Feature(feature));
        });
        return features;
      }),
      catchError(this.api.handleError)
    );
  }

  // MBL TODO: PUT/POST/DELETE functionality.
}
