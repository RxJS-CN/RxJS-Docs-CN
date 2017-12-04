import { NgModule } from '@angular/core';
import { CompaniesComponent } from './companies.component';
import { CompaniesRoutingModule } from './companies-routing.module';

@NgModule({
  imports: [CompaniesRoutingModule],
  declarations: [CompaniesComponent]
})
export class CompaniesModule {}
