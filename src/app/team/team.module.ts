import { NgModule } from '@angular/core';

import { TeamComponent } from './team.component';
import { TeamRoutingModule } from './team-routing.module';

@NgModule({
  imports: [TeamRoutingModule],
  declarations: [TeamComponent]
})
export class TeamModule {}
