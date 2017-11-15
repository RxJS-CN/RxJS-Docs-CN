import { NgModule } from '@angular/core';

import { RxjsComponent } from './rxjs.component';
import { routing } from './rxjs.routing';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [routing, SharedModule],
  declarations: [RxjsComponent]
})
export class RxjsModule {}
