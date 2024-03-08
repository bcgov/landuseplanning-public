import { Component, Input, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Project } from 'app/models/project';
import { ContactForm } from 'app/models/contactForm';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'app/services/api';
import { EmailSubscribeService } from 'app/services/emailSubscribe.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.css']
})
export class ContactFormComponent {
  @Input() project: Project;

  public loading = false;
  public name: string;
  public emailAddress: string;
  public message: string;
  public validationError = "";
  public successfulFormSubmission = false;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public activeModal: NgbActiveModal,
    private route: ActivatedRoute,
    private router: Router,
    public api: ApiService,
    private emailSubscribeService: EmailSubscribeService,
  ){}

  onSubmit(contactForm: NgForm) {
    this.loading = true;
    const contactFormResponse = new ContactForm(contactForm.value);
    contactFormResponse.project = this.project._id;
    this.emailSubscribeService.sendContactForm(contactFormResponse)
      .toPromise()
      .then(() => this.successfulFormSubmission = true)
      .catch(error => {
        alert('Uh-oh, error submitting submitting contact form request.');
        console.error('Error submitting submitting contact form request. ', error)
        this.loading = false;
        this.successfulFormSubmission = false;
      })
  }

}
