import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { flatMap, mergeMap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { EmailSubscribe } from 'app/models/emailSubscribe';
import { ContactForm } from 'app/models/contactForm';

@Injectable()
export class EmailSubscribeService {
  private emailSubscribe: EmailSubscribe = null;

  constructor(
    private api: ApiService,
  ) { }

  add(orig: EmailSubscribe): Observable<EmailSubscribe> {
    // make a (deep) copy of the passed-in comment so we don't change it
    const emailSubscribe = _.cloneDeep(orig);

    // ID must not exist on POST
    delete emailSubscribe._id;

    return this.api.addEmail(emailSubscribe)
      .map((res: EmailSubscribe) => {
        console.log('Email submitted', res);
        return res ? new EmailSubscribe(res) : null;
      })
      .catch(this.api.handleError);
  }

  unsubscribe(emailAddress: string): Observable<EmailSubscribe> {

    return this.api.unsubscribeEmail(emailAddress)
      .map((res: EmailSubscribe) => {
        return res ? new EmailSubscribe(res) : null;
      })
      .catch(this.api.handleError);
  }

  confirm(emailAddress: string, confirmKey: string): Observable<EmailSubscribe> {

    return this.api.confirmEmail(emailAddress, confirmKey)
      .map((res: EmailSubscribe) => {
        return res ? new EmailSubscribe(res) : null;
      })
      .catch(this.api.handleError);
  }

  sendContactForm(contactForm: ContactForm): Observable<boolean> {
    return this.api.sendContactFormResponse(contactForm);
  }

}
