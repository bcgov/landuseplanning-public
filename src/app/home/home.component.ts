import { Component, OnInit } from '@angular/core';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  numApplications: Number;

  constructor(private applicationService: ApplicationService) { }

  ngOnInit() {
    this.applicationService.getCount().subscribe(
      value => this.numApplications = value,
      error => console.log('ERROR =', 'could not count applications')
    );
  }
}
