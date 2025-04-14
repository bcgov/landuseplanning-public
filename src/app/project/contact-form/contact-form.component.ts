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
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent {
  @Input() project: Project;

  public loading = false;
  public name: string;
  public emailAddress: string;
  public message: string;
  public validationError = "";
  public successfulFormSubmission = false;
  public contactFormFiles: File[] = [];

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public activeModal: NgbActiveModal,
    private route: ActivatedRoute,
    private router: Router,
    public api: ApiService,
    private emailSubscribeService: EmailSubscribeService,
  ){}

  /**
   * Event handler for file list changes
   * 
   * @param files The list of selected files
   */
  public manageFileChange(files: FileList) {
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        // Check if it's already added
        if (!this.contactFormFiles.find(f => f.name === file.name)) {
          this.contactFormFiles.push(file);
        }
      }
    }
  }

  /**
   * Submits the form to the email subscribe service
   * 
   * @param contactForm The contact form to submit
   */
  onSubmit(contactForm: NgForm) {
    this.loading = true;
    const contactFormResponse = new ContactForm(contactForm.value);
    contactFormResponse.project = this.project._id;
    contactFormResponse.files = this.contactFormFiles || [];
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
