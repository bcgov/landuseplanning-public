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
    // this.newsService.getAll().subscribe(
    //   data => { this.results = data; },
    //   error => console.log(error)
    // );
    this.applicationService.getAll().subscribe(
      data => { this.numApplications = data ? data.length : 0; },
      error => console.log(error)
    );
  }
}
