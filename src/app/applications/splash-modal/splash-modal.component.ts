import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  templateUrl: './splash-modal.component.html',
  styleUrls: ['./splash-modal.component.scss']
})

export class SplashModalComponent {

  public clidDtid: number = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public activeModal: NgbActiveModal // also used in template
  ) { }

  public find() {
    if (this.clidDtid) {
      this.activeModal.close('finding');
      // navigate to Find page
      this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { clidDtid: this.clidDtid }, replaceUrl: true });
    }
  }

  public explore() {
    this.activeModal.close('exploring');
    // navigate to Explore page (and open it)
    this.router.navigate([], { relativeTo: this.activatedRoute, fragment: 'explore', replaceUrl: true });
  }

}
