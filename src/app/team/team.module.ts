import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatIconRegistry
} from '@angular/material';

import { routing } from './team.routing';
import { TeamComponent } from './team.component';
import { TeamService } from './team.service';
import { MemberComponent } from './member.component';
import { SocialSharingComponent } from './social-sharing/social-sharing.component';

@NgModule({
  imports: [
    routing,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  providers: [TeamService, MatIconRegistry],
  declarations: [TeamComponent, MemberComponent, SocialSharingComponent]
})
export class TeamModule {
  constructor(private matIconRegistry: MatIconRegistry) {
    matIconRegistry.registerFontClassAlias('fontawesome', 'fa');
  }
 }
