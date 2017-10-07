import { NgModule } from '@angular/core';

import { OperatorsComponent } from './operators.component';
import { routing } from './operators.routing';

@NgModule({
    imports: [routing],
    declarations: [OperatorsComponent]
})
export class OperatorsModule { }
