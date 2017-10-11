import { Component, Input } from '@angular/core';
import { OperatorExtra } from '../../../../operator-docs';

@Component({
  selector: 'app-operator-extras',
  templateUrl: './operator-extras.component.html',
  styleUrls: ['./operator-extras.component.scss']
})
export class OperatorExtrasComponent {
  @Input() operatorExtras: OperatorExtra[] = [];

  get tips() {
    return this.operatorExtras.filter(e => e.type === 'Tip');
  }

  get warnings() {
    return this.operatorExtras.filter(e => e.type === 'Warning');
  }
}
