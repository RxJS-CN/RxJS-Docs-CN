import { NgModule } from '@angular/core';

import { TeamComponent } from './team.component';
import { TeamRoutingModule } from './team-routing.module';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [TeamRoutingModule, SharedModule],
  declarations: [TeamComponent]
})
export class TeamModule {}
