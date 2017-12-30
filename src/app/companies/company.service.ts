import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { COMPANIES_LIST } from './companies-list';
import { Company } from './companies.model';

@Injectable()
export class CompanyService {
  getCompanies(): Observable<Company[]> {
    return of(COMPANIES_LIST);
  }
}
