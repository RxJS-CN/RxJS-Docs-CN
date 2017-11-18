import { ModuleWithProviders, NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

export const routes: Routes = [
  { path: '', loadChildren: './rxjs/rxjs.module#RxjsModule' },
  {
    path: 'operators',
    loadChildren: './operators/operators.module#OperatorsModule'
  },
  { path: 'team', loadChildren: './team/team.module#TeamModule' },
  {
    path: 'companies',
    loadChildren: './companies/companies.module#CompaniesModule'
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
