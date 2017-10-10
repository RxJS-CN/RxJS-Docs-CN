import { Component, Input } from '@angular/core';
import { OperatorParameters } from '../../../../operator-docs';

@Component({
  selector: 'app-marble-diagram',
  templateUrl: './marble-diagram.component.html',
  styleUrls: ['./marble-diagram.component.scss']
})
export class MarbleDiagramComponent {
  @Input() url: string;
}
