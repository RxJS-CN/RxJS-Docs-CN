import { NgModule } from '@angular/core';

import { CompaniesComponent } from './companies.component';
import { routing } from './companies.routing';

@NgModule({
    imports: [routing],
    declarations: [CompaniesComponent]
})
export class CompaniesModule { }