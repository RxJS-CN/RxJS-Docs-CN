import { NgModule } from '@angular/core';

import { RxjsComponent } from './rxjs.component';
import { RxjsRoutingModule } from './rxjs-routing.module';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [RxjsRoutingModule, SharedModule],
  declarations: [RxjsComponent]
})
export class RxjsModule {}
