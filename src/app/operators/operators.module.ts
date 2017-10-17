import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import {
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatToolbarModule,
  MatExpansionModule,
  MatCardModule,
  MatInputModule,
  MatMenuModule,
  MatButtonModule,
  MatTooltipModule
} from '@angular/material';
import { ClipboardModule } from 'ngx-clipboard';

import { OperatorsRoutingModule } from './operators.routing';

import { OperatorsComponent } from './operators.component';
import { OperatorComponent } from './components/operator/operator.component';
import { OperatorHeaderComponent } from './components/operator-header/operator-header.component';
import { OperatorParametersComponent } from './components/operator-parameters/operator-parameters.component';
import { OperatorExamplesComponent } from './components/operator-examples/operator-examples.component';
import { RelatedOperatorsComponent } from './components/related-operators/related-operators.component';
import { OperatorExtrasComponent } from './components/operator-extras/operator-extras.component';
import { AdditionalResourcesComponent } from './components/additional-resources/additional-resources.component';
import { MarbleDiagramComponent } from './components/marble-diagram/marble-diagram.component';
import { WalkthroughComponent } from './components/walkthrough/walkthrough.component';

import { OperatorScrollDirective } from './directives/operator-scroll.directive';
import { HighlightJsDirective } from './directives/highlight-js.directive';

import { SafeUrlPipe } from './pipes/safe-url.pipe';

@NgModule({
  declarations: [
    OperatorsComponent,
    OperatorComponent,
    OperatorHeaderComponent,
    OperatorParametersComponent,
    OperatorExamplesComponent,
    RelatedOperatorsComponent,
    OperatorExtrasComponent,
    AdditionalResourcesComponent,
    WalkthroughComponent,
    MarbleDiagramComponent,
    OperatorScrollDirective,
    HighlightJsDirective,
    SafeUrlPipe
  ],
  imports: [
    CommonModule,
    OperatorsRoutingModule,
    ClipboardModule,
    LayoutModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
    MatCardModule,
    MatInputModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class OperatorsModule { }
