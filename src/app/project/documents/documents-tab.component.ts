import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-documents',
  templateUrl: './documents-tab.component.html',
  styleUrls: ['./documents-tab.component.scss']
})
export class DocumentsTabComponent implements OnInit {
  documents: any[];
  loading: boolean;
  constructor() {
    this.loading = false;
    this.documents = [];
   }

  ngOnInit() {
  }

}
