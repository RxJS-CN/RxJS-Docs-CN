import { NgModule } from '@angular/core';

import { TeamComponent } from './team.component';
import { routing } from './team.routing';

@NgModule({
    imports: [routing],
    declarations: [TeamComponent]
})
export class TeamModule { }
