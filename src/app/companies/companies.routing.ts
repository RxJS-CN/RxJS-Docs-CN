import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompaniesComponent } from './companies.component';

const routes: Routes = [
    { path: '', component: CompaniesComponent }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);