import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OperatorsComponent } from './operators.component';
import { OperatorComponent } from './components/operator/operator.component';

const routes: Routes = [
  {
    path: '',
    component: OperatorsComponent,
    children: [{ path: ':operator', component: OperatorComponent }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperatorsRoutingModule {}
