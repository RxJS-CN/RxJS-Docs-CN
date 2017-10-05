import { Component, Input, OnInit } from '@angular/core';
import { OperatorDoc } from '../../operator-docs/operator.model';

@Component({
  selector: 'app-operator',
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.scss']
})
export class OperatorComponent {
  @Input() operator: OperatorDoc;

  get operatorName() {
    return this.operator.name;
  }

  get signature() {
    return 'Signature';
  }
}
