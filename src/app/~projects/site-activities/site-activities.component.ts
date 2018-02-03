import { Component, Input } from '@angular/core';

import { Project } from '../../models/project';

@Component({
  selector: 'app-site-activities',
  templateUrl: './site-activities.component.html',
  styleUrls: ['./site-activities.component.scss']
})
export class SiteActivitiesComponent {
  @Input() activities: {
    order: number;  // display order, not any business rules order
    status: string;  // one of: 'Active', 'Inactive', 'Pending', 'Complete', 'Suspended', 'N/A', ''
    name: string;
    cssClass?: string;
  }[] = [];

  constructor() { }
}
