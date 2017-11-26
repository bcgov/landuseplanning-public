import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/add/operator/map';

import { Api } from './api';

@Injectable()
export class NewsService {

  constructor(private api: Api) { }

  getAll() {
    return this.api.getNews()
      .map((res: Response) => res.json());
  }

  getRecentNews() {
    return this.api.getNews()
      .map((res: Response) => res.json().slice(0, 4));
  }
}
