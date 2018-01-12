import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { TeamService } from './team.service';
import { ITeam } from './team.models';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  team$: Observable<ITeam>;

  constructor(
    private service: TeamService
  ) {}

  ngOnInit() {
    this.team$ = this.service.getTeam();
  }
}
