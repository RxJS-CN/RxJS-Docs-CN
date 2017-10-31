import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CompanyService } from '../companies/company.service';

@Component({
  selector: 'app-company-dialog',
  templateUrl: './company-dialog.component.html',
  styleUrls: ['./company-dialog.component.scss']
})
export class CompanyDialogComponent {
  companyForm: FormGroup;
  selectedFile: File;

  constructor(private formBuilder: FormBuilder) {
    this.createCompanyForm();
  }

  detectFiles(event) {
    const fileControl = this.companyForm.get('File');
    this.selectedFile = event.target.files.item(0).name;
    fileControl.setValue(event.target.files.item(0));
  }

  private createCompanyForm() {
    this.companyForm = this.formBuilder.group({
      Name: ['', Validators.required],
      Location: ['', Validators.required],
      Website: ['', Validators.required],
      File: ''
    });
  }

  private subscribeToForm() {
    const nameControl = this.companyForm.get('Name');
    nameControl.valueChanges.forEach((value: string) => console.log(value));
    const locationControl = this.companyForm.get('Location');
    nameControl.valueChanges.forEach((value: string) => console.log(value));
    const websiteControl = this.companyForm.get('Website');
    nameControl.valueChanges.forEach((value: string) => console.log(value));
  }
}
