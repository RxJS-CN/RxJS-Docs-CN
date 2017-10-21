import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-related-operators',
  templateUrl: './related-operators.component.html',
  styleUrls: ['./related-operators.component.scss']
})
export class RelatedOperatorsComponent {
  @Input() relatedOperators: string[];
}
