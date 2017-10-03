import { Component, OnInit } from '@angular/core';
import { ALL_OPERATORS } from '../operator-docs';

@Component({
  selector: 'app-operators',
  templateUrl: './operators.component.html',
  styleUrls: ['./operators.component.scss']
})
export class OperatorsComponent implements OnInit {
  public operators = ALL_OPERATORS;

  constructor() { }

  ngOnInit() {
  }

}
