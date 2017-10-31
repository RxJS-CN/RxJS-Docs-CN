import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { MatDialog } from '@angular/material';

import { CompanyDialogComponent } from '../company-dialog/company-dialog.component';
import { CompanyService } from './company.service';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent {
  companies: Observable<any[]>;
  private uploadTask: firebase.storage.UploadTask;
  private companiesCollection: AngularFirestoreCollection<any>;
  constructor(
    db: AngularFirestore,
    private dialog: MatDialog,
    private companyService: CompanyService
  ) {
    this.companiesCollection = db.collection('companies');
    this.companies = this.companiesCollection.valueChanges();
  }

  uploadSingle(file: any) {
    return this.companyService.pushUpload(file);
  }

  addCompany() {
    const dialogRef = this.dialog.open(CompanyDialogComponent, {});
    dialogRef.afterClosed().subscribe(company => {
      if (company) {
        const file = this.uploadSingle(company.File).then((fileResult: any) => {
          company.File = fileResult.downloadURL;
          this.companiesCollection.add(company).then(result => {
            console.log(result);
          });
        });
      }
    });
  }

  openWindow(url: string) {
    window.open(url, '_blank');
  }
}
