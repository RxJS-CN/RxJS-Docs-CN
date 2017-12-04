import { TestBed, inject } from '@angular/core/testing';

import { SeoService } from './seo.service';

describe('SeoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeoService]
    });
  });

  it(
    'should be created',
    inject([SeoService], (service: SeoService) => {
      expect(service).toBeTruthy();
    })
  );
});
