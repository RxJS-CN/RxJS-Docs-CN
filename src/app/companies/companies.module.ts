import { CommonModule } from '@angular/common';
import { MaterialModule } from './../material/material.module';
import { NgModule } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';

import { CompaniesComponent } from './companies.component';
import { CompaniesRoutingModule } from './companies-routing.module';
import { environment } from '../../environments/environment';
import { CompanyDialogComponent } from '../company-dialog/company-dialog.component';
import { MatDialogRef } from '@angular/material';
import { CompanyService } from './company.service';
import { AngularFireDatabase } from 'angularfire2/database';
@NgModule({
  imports: [
    CommonModule,
    CompaniesRoutingModule,
    MaterialModule,
    AngularFirestoreModule,
    AngularFireModule.initializeApp(environment.firebase)
  ],
  declarations: [CompaniesComponent, CompanyDialogComponent],
  entryComponents: [CompanyDialogComponent],
  providers: [CompanyService, AngularFireDatabase]
})
export class CompaniesModule {}
