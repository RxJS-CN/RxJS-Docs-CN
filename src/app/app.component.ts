import { Component, OnInit } from '@angular/core';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  RouterEvent
} from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { SeoService, SeoData } from './core/services/seo.service';
import { OperatorMenuService } from './core/services/operator-menu.service';

interface Menu {
  title: string;
  link: string;
  options: { exact: boolean };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  menus: Menu[] = [
    {
      title: 'Home',
      link: '/',
      options: { exact: true }
    },
    {
      title: 'Operators',
      link: '/operators',
      options: { exact: false }
    },
    {
      title: 'Companies',
      link: '/companies',
      options: { exact: false }
    },
    {
      title: 'Team',
      link: '/team',
      options: { exact: false }
    }
  ];

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _seo: SeoService,
    private _operatorMenuService: OperatorMenuService
  ) {}

  ngOnInit() {
    this._router.events
      .pipe(
        filter((e: RouterEvent) => e instanceof NavigationEnd),
        map(() => {
          let route = this._activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data),
        filter((data: SeoData) => data.title !== undefined)
      )
      .subscribe((data: SeoData) => this._seo.setHeaders(data));
  }

  shouldOpenChildMenu(title: string) {
    // for accessibility we need to ensure child menu is open when clicked
    if (title === 'Operators') {
      this._operatorMenuService.openOperatorMenu();
    }
  }
}
