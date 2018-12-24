import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export enum SplashModalResult {
  Dismissed,
  Finding,
  Exploring
}

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

  public dismiss() {
    this.activeModal.close(SplashModalResult.Dismissed);
  }

  public find() {
    this.activeModal.close(SplashModalResult.Finding);
    // set URL parameter (but don't open Find panel)
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { clidDtid: this.clidDtid }, replaceUrl: true });
  }

  public explore() {
    this.activeModal.close(SplashModalResult.Exploring);
    // open Explore panel (but don't set URL parameters)
    this.router.navigate([], { relativeTo: this.activatedRoute, fragment: 'explore', replaceUrl: true });
  }

}
