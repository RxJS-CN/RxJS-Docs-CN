import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule, MatButtonModule } from '@angular/material';

import { routing } from './team.routing';
import { TeamComponent } from './team.component';
import { TeamService } from './team.service';
import { MemberComponent } from './member.component';

@NgModule({
  imports: [
    routing,
    CommonModule,
    MatCardModule,
    MatButtonModule
  ],
  providers: [TeamService],
  declarations: [TeamComponent, MemberComponent]
})
export class TeamModule { }
