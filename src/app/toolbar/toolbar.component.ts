import { Component, OnInit } from "@angular/core";

interface Menu {
  title: string;
  link: string;
  options: { exact: boolean };
}

@Component({
  selector: "app-toolbar",
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.scss"]
})
export class ToolbarComponent implements OnInit {
  menus: Menu[] = [
    {
      title: "Home",
      link: "/",
      options: { exact: true }
    },
    {
      title: "Operators",
      link: "/operators",
      options: { exact: false }
    },
    {
      title: "Companies",
      link: "/companies",
      options: { exact: false }
    },
    {
      title: "Team",
      link: "/team",
      options: { exact: false }
    }
  ];

  constructor() {}

  ngOnInit() {}
}
