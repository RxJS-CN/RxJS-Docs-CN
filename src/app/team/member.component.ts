import { Component, Input } from '@angular/core';

import { IMember } from './team.models';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss']
})
export class MemberComponent {
  @Input() member: IMember;
}
