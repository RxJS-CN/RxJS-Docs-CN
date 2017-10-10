import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OperatorsComponent } from './operators.component';

const routes: Routes = [
    { path: '', component: OperatorsComponent }
];

export const OperatorsRoutingModule: ModuleWithProviders = RouterModule.forChild(routes);
