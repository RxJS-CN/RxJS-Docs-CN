import { TestBed, inject } from '@angular/core/testing';

import { CompanyService } from './company.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireModule } from 'angularfire2';
import { environment } from '../../environments/environment';

describe('CompanyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFirestoreModule,
        AngularFireModule.initializeApp(environment.firebase)
      ],
      providers: [CompanyService, AngularFireDatabase]
    });
  });

  it(
    'should be created',
    inject([CompanyService, AngularFireDatabase], (service: CompanyService) => {
      expect(service).toBeTruthy();
    })
  );
});
