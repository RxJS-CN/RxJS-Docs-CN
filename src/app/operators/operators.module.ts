import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatToolbarModule,
  MatExpansionModule,
  MatCardModule,
  MatInputModule,
  MatMenuModule,
  MatButtonModule
} from '@angular/material';
import { RouterModule } from '@angular/router';

import { OperatorsComponent } from './operators.component';
import { OperatorComponent } from './components/operator/operator.component';
import { OperatorHeaderComponent } from './components/operator-header/operator-header.component';

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
    OperatorScrollDirective,
    HighlightJsDirective
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(OPERATOR_ROUTES),
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
    MatCardModule,
    MatInputModule,
    MatMenuModule,
    MatButtonModule
  ]
})
export class OperatorsModule { }
