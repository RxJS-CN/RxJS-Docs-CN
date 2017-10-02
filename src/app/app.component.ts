import { Component } from '@angular/core';

class Menu {
  title: string;
  link: string;
  options: { exact: boolean }; 
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
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
  ]
}
