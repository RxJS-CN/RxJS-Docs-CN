import { COMPANIES_LIST } from './companies-list';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MatDialog } from '@angular/material';

import { CompanyService } from './company.service';
import { Company } from './companies.model';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent {
  companies: Observable<Company[]>;
  constructor(private companyService: CompanyService) {
    this.companies = this.companyService.getCompanies();
  }
}
