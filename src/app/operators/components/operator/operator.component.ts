import { Component, Input, OnInit } from '@angular/core';
import { OperatorDoc } from '../../../../operator-docs/operator.model';

@Component({
  selector: 'app-operator',
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.scss']
})
export class OperatorComponent {
  @Input() operator: OperatorDoc;

  private readonly baseSourceUrl = 'https://github.com/ReactiveX/rxjs/blob/master/src/operators/';

  get operatorName() {
    return this.operator.name;
  }

  get signature() {
    return this.operator.signature || 'Signature Placeholder';
  }

  get marbleUrl() {
    return this.operator.marbleUrl;
  }

  get shortDescription() {
    return this.operator.shortDescription && this.operator.shortDescription.description;
  }

  get longDescription() {
    return this.operator.longDescription && this.operator.shortDescription.description;
  }

  get parameters() {
    return this.operator.parameters || [];
  }

  get examples() {
    return this.operator.examples || [];
  }

  get relatedOperators() {
    return this.operator.relatedOperators || [];
  }

  get sourceUrl() {
    return `${this.baseSourceUrl}/${this.operatorName}.ts`;
  }

  get additionalResources() {
    return this.operator.additionalResources || [];
  }
}
