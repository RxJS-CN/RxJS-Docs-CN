import { Component, OnInit } from '@angular/core';
import { ALL_OPERATORS } from '../operator-docs';
import { OperatorDoc } from '../operator-docs/operator.model';

@Component({
  selector: 'app-operators',
  templateUrl: './operators.component.html',
  styleUrls: ['./operators.component.scss']
})
export class OperatorsComponent implements OnInit {
  public operators = groupOperatorsByType(ALL_OPERATORS);
  public categories = Object.keys(this.operators);

  constructor() { }

  ngOnInit() {}

}

export function groupOperatorsByType(operators: OperatorDoc[]) {
  return operators.reduce((acc, curr) => {
    if (acc[curr.operatorType]) {
      return { ...acc, [ curr.operatorType ] : [ ...acc[ curr.operatorType ], curr ] };
    }
    return { ...acc, [ curr.operatorType ]: [ curr ] };
  }, {});
}
