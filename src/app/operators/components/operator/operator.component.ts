import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  InjectionToken
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SeoService } from '../../../services/seo.service';
import { OperatorDoc } from '../../../../operator-docs/operator.model';
import 'rxjs/add/operator/pluck';

export const OPERATOR_TOKEN = new InjectionToken<string>('operators');

@Component({
  selector: 'app-operator',
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.scss']
})
export class OperatorComponent implements OnInit {
  public operator: OperatorDoc;

  private readonly baseSourceUrl = 'https://github.com/ReactiveX/rxjs/blob/master/src/operators/';
  private readonly baseSpecUrl = 'http://reactivex.io/rxjs/test-file/spec-js/operators';

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    @Inject(OPERATOR_TOKEN) public operators: OperatorDoc[],
    private _seo: SeoService
  ) {}

  ngOnInit() {
    this._activatedRoute.params.pluck('operator').subscribe((name: string) => {
      this.operator =
        this.operators.filter(
          (operator: OperatorDoc) => operator.name === name
        )[0] || this.notfound();
      this._seo.setHeaders(
        [this.operator.name, this.operator.operatorType],
        this.operator.shortDescription
          ? this.operator.shortDescription.description
          : ''
      );
    });
  }

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

  private notfound() {
    this._router.navigate(['/operators']);
    return {};
  }
}
