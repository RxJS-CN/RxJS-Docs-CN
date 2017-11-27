import {
  NgModule,
  InjectionToken,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { LayoutModule } from '@angular/cdk/layout';
import { ClipboardModule } from 'ngx-clipboard';

import { ALL_OPERATORS, OperatorDoc } from '../../operator-docs';
import { OperatorsRoutingModule } from './operators-routing.module';
import { OperatorsComponent, OPERATORS_TOKEN } from './operators.component';
import {
  OperatorComponent,
  OPERATOR_TOKEN
} from './components/operator/operator.component';
import { OperatorHeaderComponent } from './components/operator-header/operator-header.component';
import { OperatorParametersComponent } from './components/operator-parameters/operator-parameters.component';
import { OperatorExamplesComponent } from './components/operator-examples/operator-examples.component';
import { RelatedOperatorsComponent } from './components/related-operators/related-operators.component';
import { OperatorExtrasComponent } from './components/operator-extras/operator-extras.component';
import { AdditionalResourcesComponent } from './components/additional-resources/additional-resources.component';
import { MarbleDiagramComponent } from './components/marble-diagram/marble-diagram.component';
import { WalkthroughComponent } from './components/walkthrough/walkthrough.component';
import { HighlightJsDirective } from './directives/highlight-js.directive';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { SharedModule } from '../shared.module';

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
    HighlightJsDirective,
    SafeUrlPipe
  ],
  imports: [
    SharedModule,
    OperatorsRoutingModule,
    ClipboardModule,
    LayoutModule
  ],
  providers: [
    { provide: OPERATORS_TOKEN, useValue: ALL_OPERATORS },
    { provide: OPERATOR_TOKEN, useValue: ALL_OPERATORS }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OperatorsModule {}
