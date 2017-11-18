import { NgModule } from '@angular/core';

import { CompaniesComponent } from './companies.component';
import { CompaniesRoutingModule } from './companies-routing.module';
import { SharedModule } from '../shared.module';
import { environment } from '../../environments/environment';

@NgModule({
  imports: [CompaniesRoutingModule, SharedModule],
  declarations: [CompaniesComponent]
})
export class CompaniesModule {}
