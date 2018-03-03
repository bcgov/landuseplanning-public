import { Component } from '@angular/core';
import { ApiService } from 'app/services/api';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})

export class FooterComponent {

  constructor(private api: ApiService) { }

}
