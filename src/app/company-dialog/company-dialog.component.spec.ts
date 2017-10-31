// import { async, ComponentFixture, TestBed } from '@angular/core/testing';

// import { CompanyDialogComponent } from './company-dialog.component';
// import { NgModule } from '@angular/core';
// import { MatDialogModule, MatDialog } from '@angular/material';
// import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

// import { SharedModule } from '../shared.module';
// import { inject } from '@angular/core/testing';
// import { CompaniesModule } from '../companies/companies.module';
// import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
// import { CommonModule } from '@angular/common';

// describe('CompanyDialogComponent', () => {
//   let component: CompanyDialogComponent;
//   let fixture: ComponentFixture<CompanyDialogComponent>;
//   let dialog: MatDialog;

//   beforeEach(
//     async(() => {
//       TestBed.configureTestingModule({
//         imports: [SharedModule, NoopAnimationsModule],
//         declarations: [CompanyDialogComponent],
//         providers: [],
//       }).overrideModule(BrowserDynamicTestingModule, {
//         set: {
//           entryComponents: [CompanyDialogComponent]
//         }
//       }).compileComponents();
//     })
//   );

//   beforeEach(() => {
//     fixture = TestBed.createComponent(CompanyDialogComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();

//     dialog = TestBed.get(MatDialog);
//     let dialogRef = dialog.open(CompanyDialogComponent);
//     component = dialogRef.componentInstance;
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
