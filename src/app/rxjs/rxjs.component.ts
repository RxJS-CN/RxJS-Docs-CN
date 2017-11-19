import { Component, OnInit } from '@angular/core';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-rxjs',
  templateUrl: './rxjs.component.html',
  styleUrls: ['./rxjs.component.scss']
})
export class RxjsComponent implements OnInit {
  constructor(private _seo: SeoService) {}

  ngOnInit() {
    this._seo.setHeaders([], this._seo.homeDescription);
  }
}
