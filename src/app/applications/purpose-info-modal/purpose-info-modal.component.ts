import { Component, HostBinding } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'app/utils/constants';

@Component({
  selector: 'app-purpose-info-modal',
  templateUrl: './purpose-info-modal.component.html',
  styleUrls: ['./purpose-info-modal.component.scss']
})
export class PurposeInfoModalComponent {
  @HostBinding('class') classes = 'modal-content-flex';

  constants = Constants;

  constructor(public activeModal: NgbActiveModal) {}
}
