import { NgModule } from '@angular/core';

import { TeamComponent } from './team.component';
import { routing } from './team.routing';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [routing, SharedModule],
  declarations: [TeamComponent]
})
export class TeamModule {}
