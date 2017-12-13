import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OperatorsComponent } from './operators.component';
import { OperatorComponent } from './components/operator/operator.component';
import { ALL_OPERATORS } from '../../operator-docs';

const routes: Routes = [
  {
    path: '',
    component: OperatorsComponent,
    data: { title: ['Operators'], description: 'All the RxJS operators...' },
    children: [
      {
        path: ':operator',
        component: OperatorComponent
      },
      {
        path: '',
        redirectTo: ALL_OPERATORS[0].name,
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperatorsRoutingModule {}
