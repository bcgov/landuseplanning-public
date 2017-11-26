import { Component, OnInit } from '@angular/core';
import { Home } from '../models/home';
import { NewsService } from '../services/news.service';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  results: Array<Home>;
  numProjects: Number;
  constructor(private newsService: NewsService, private projectService: ProjectService) { }

  ngOnInit() {
    this.newsService.getAll().subscribe(
      data => { this.results = data; },
      error => console.log(error)
    );
    this.projectService.getAll().subscribe(
      data => { this.numProjects = data ? data.length : 0; },
      error => console.log(error)
    );
  }
}
