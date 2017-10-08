import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-operator-header',
  templateUrl: './operator-header.component.html',
  styleUrls: ['./operator-header.component.scss']
})
export class OperatorHeaderComponent {
  @Input() operatorName: string;
  @Input() operatorSignature: string;
}
