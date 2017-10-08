import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ALL_OPERATORS } from '../operator-docs';
import { OperatorDoc } from '../operator-docs/operator.model';
import 'rxjs/add/operator/pluck';

@Component({
  selector: 'app-operators',
  templateUrl: './operators.component.html',
  styleUrls: ['./operators.component.scss']
})
export class OperatorsComponent implements OnInit, AfterViewInit {
  public operators = ALL_OPERATORS;
  public groupedOperators = groupOperatorsByType(ALL_OPERATORS);
  public categories = Object.keys(this.groupedOperators);
  public activeOperator$: Observable<string>;

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activeOperator$ = this._activatedRoute
      .params
      .pluck('name');
  }

  ngAfterViewInit() {
    // scroll initial param when applicable
    const { name } = this._activatedRoute.snapshot.params;

    if (name) {
      // wait a tick from scroll to be accurate
      Promise.resolve().then(_ => this.scrollToOperator(name));
    }
  }

  updateUrl(name: string) {
    this._router.navigate([ '/operators', { name } ]);
  }

  scrollToOperator(name: string) {
    const element = document.getElementById(name);

    if (element) {
      element.scrollIntoView();
    }
  }
}

export function groupOperatorsByType(operators: OperatorDoc[]) {
  return operators.reduce((acc, curr) => {
    if (acc[curr.operatorType]) {
      return { ...acc, [ curr.operatorType ] : [ ...acc[ curr.operatorType ], curr ] };
    }
    return { ...acc, [ curr.operatorType ]: [ curr ] };
  }, {});
}
