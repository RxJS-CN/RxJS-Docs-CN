import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdSidenavModule, MdIconModule,  MdListModule } from '@angular/material';
import { RouterModule } from '@angular/router';

import { OperatorsComponent } from './operators.component';

const OPERATOR_ROUTES = [
  {
    path: '',
    component: OperatorsComponent
  }
];

@NgModule({
  declarations: [
    OperatorsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(OPERATOR_ROUTES),
    MdSidenavModule,
    MdIconModule,
    MdListModule
  ]
})
export class OperatorsModule { }
