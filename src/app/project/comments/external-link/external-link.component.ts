import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/forkJoin';

@Component({
  templateUrl: './external-link.component.html',
  styleUrls: ['./external-link.component.scss']
})

export class ExternalLinkComponent {
  @Input() externalToolPopupText: string;
  @Input() externalToolPopupURL: string;

  constructor(
    public activeModal: NgbActiveModal,
  ) {}

  register() {
  }

  makeAriaLabel(docName: string) {
    const docPhrase = docName ?? 'this';
    return `Remove ${docPhrase} uploaded document.`;
  }
}
