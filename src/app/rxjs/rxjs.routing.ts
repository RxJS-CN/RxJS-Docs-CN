import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RxjsComponent } from './rxjs.component';

const routes: Routes = [
    { path: '', component: RxjsComponent }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);