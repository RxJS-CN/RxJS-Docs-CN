import { Component, OnInit } from '@angular/core';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit {
  constructor(private _seo: SeoService) {}

  ngOnInit() {
    this._seo.setHeaders(['Companies'], this._seo.companiesDescription);
  }
}
