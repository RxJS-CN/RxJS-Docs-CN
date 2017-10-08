import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule, MatIconModule, MatListModule, MatToolbarModule } from '@angular/material';
import { RouterModule } from '@angular/router';

import { OperatorsComponent } from './operators.component';
import { OperatorComponent } from './operator/operator.component';
import { OperatorHeaderComponent } from './operator/operator-header/operator-header.component';

import { OperatorScrollDirective } from './directives/operator-scroll.directive';
import { HighlightJsDirective } from './directives/highlight-js.directive';

const OPERATOR_ROUTES = [
  {
    path: '',
    component: OperatorsComponent
  }
];

@NgModule({
  declarations: [
    OperatorsComponent,
    OperatorComponent,
    OperatorHeaderComponent,
    OperatorScrollDirective
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(OPERATOR_ROUTES),
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule
  ]
})
export class OperatorsModule { }
