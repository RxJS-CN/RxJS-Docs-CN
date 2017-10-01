import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompaniesComponent } from './companies/companies.component';
import { OperatorsComponent } from './operators/operators.component';
import { RxjsComponent } from './rxjs/rxjs.component';
import { TeamComponent } from './team/team.component';

const appRoutes: Routes = [
  { path: '', component: RxjsComponent },
  { path: 'rxjs', component: RxjsComponent},
  { path: 'operators', component: OperatorsComponent },
  { path: 'team', component: TeamComponent },
  { path: 'companies', component: CompaniesComponent }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);