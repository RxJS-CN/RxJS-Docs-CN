import { TestBed, inject } from '@angular/core/testing';

import { CompanyService } from './company.service';
import { environment } from '../../environments/environment';

describe('CompanyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [CompanyService]
    });
  });

  it(
    'should be created',
    inject([CompanyService], (service: CompanyService) => {
      expect(service).toBeTruthy();
    })
  );
});
