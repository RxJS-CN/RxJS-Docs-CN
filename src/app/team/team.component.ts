import { Component, OnInit } from '@angular/core';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  constructor(private _seo: SeoService) {}

  ngOnInit() {
    this._seo.setHeaders(['The Team'], this._seo.teamDescription);
  }
}
