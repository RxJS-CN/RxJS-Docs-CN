import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdSidenavModule, MdIconModule,  MdListModule, MdToolbarModule } from '@angular/material';
import { RouterModule } from '@angular/router';

import { OperatorsComponent } from './operators.component';
import { OperatorComponent } from './operator/operator.component';

const OPERATOR_ROUTES = [
  {
    path: '',
    component: OperatorsComponent
  }
];

@NgModule({
  declarations: [
    OperatorsComponent,
    OperatorComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(OPERATOR_ROUTES),
    MdSidenavModule,
    MdIconModule,
    MdListModule,
    MdToolbarModule
  ]
})
export class OperatorsModule { }
