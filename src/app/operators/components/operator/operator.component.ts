import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { OperatorDoc } from '../../../../operator-docs/operator.model';

@Component({
  selector: 'app-operator',
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperatorComponent {
  @Input() operator: OperatorDoc;

  private readonly baseSourceUrl = 'https://github.com/ReactiveX/rxjs/blob/master/src/operators/';
  private readonly baseSpecUrl = 'http://reactivex.io/rxjs/test-file/spec-js/operators';

  get operatorName() {
    return this.operator.name;
  }

  get signature() {
    return this.operator.signature || 'Signature Placeholder';
  }

  get marbleUrl() {
    return this.operator.marbleUrl;
  }

  get useInteractiveMarbles() {
    return this.operator.useInteractiveMarbles;
  }

  get shortDescription() {
    return (
      this.operator.shortDescription &&
      this.operator.shortDescription.description
    );
  }

  get shortDescriptionExtras() {
    return (
      this.operator.shortDescription && this.operator.shortDescription.extras
    );
  }

  get walkthrough() {
    return this.operator.walkthrough && this.operator.walkthrough.description;
  }

  get walkthroughExtras() {
    return this.operator.walkthrough && this.operator.walkthrough.extras;
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

  get specsUrl() {
    return `${this.baseSpecUrl}/${this.operatorName}-spec.js.html`;
  }

  get additionalResources() {
    return this.operator.additionalResources || [];
  }
}
