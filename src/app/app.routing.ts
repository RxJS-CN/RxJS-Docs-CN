import { ModuleWithProviders } from '@angular/core';
import { Routes } from '@angular/router';

import { CompaniesComponent } from './companies/companies.component';
import { OperatorsComponent } from './operators/operators.component';
import { RxjsComponent } from './rxjs/rxjs.component';
import { TeamComponent } from './team/team.component';

export const RXJS_DOC_ROUTES: Routes = [
  { path: '', component: RxjsComponent },
  { path: 'operators', component: OperatorsComponent },
  { path: 'team', component: TeamComponent },
  { path: 'companies', component: CompaniesComponent },
  { path: '**', redirectTo: '' }
];
