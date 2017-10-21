import { Component, Input } from '@angular/core';
import { OperatorExample } from '../../../../operator-docs';

@Component({
  selector: 'app-operator-walkthrough',
  templateUrl: './walkthrough.component.html',
  styleUrls: ['./walkthrough.component.scss']
})
export class WalkthroughComponent {
  @Input() operatorWalkthrough: string;
}
