import { Component, Input } from '@angular/core';
import { OperatorParameters } from '../../../../operator-docs';

@Component({
  selector: 'app-operator-parameters',
  templateUrl: './operator-parameters.component.html',
  styleUrls: ['./operator-parameters.component.scss']
})
export class OperatorParametersComponent {
  @Input() operatorParameters: OperatorParameters[];
}
