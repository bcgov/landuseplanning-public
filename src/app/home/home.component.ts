import { Component, OnInit } from '@angular/core';
import { Home } from '../models/home';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  results: Array<Home>;
  numApplications: Number;
  constructor(private applicationService: ApplicationService) { }

  ngOnInit() {
    this.applicationService.getCount().subscribe(
      count => this.numApplications = count,
      error => console.log('ERROR =', 'could not get all applications')
    );
  }
}
