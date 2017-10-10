import { ModuleWithProviders } from '@angular/core';
import { Routes } from '@angular/router';

import { CompaniesComponent } from './companies/companies.component';
import { OperatorsComponent } from './operators/operators.component';
import { RxjsComponent } from './rxjs/rxjs.component';
import { TeamComponent } from './team/team.component';

export const RXJS_DOC_ROUTES: Routes = [
  { path: '', loadChildren: './rxjs/rxjs.module#RxjsModule' },
  { path: 'operators', loadChildren: './operators/operators.module#OperatorsModule' },
  { path: 'team', loadChildren: './team/team.module#TeamModule' },
  { path: 'companies', loadChildren: './companies/companies.module#CompaniesModule' },
  { path: '**', redirectTo: '' }
];
