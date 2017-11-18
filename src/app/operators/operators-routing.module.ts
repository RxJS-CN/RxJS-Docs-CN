import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OperatorsComponent } from './operators.component';

const routes: Routes = [{ path: '', component: OperatorsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperatorsRoutingModule {}
