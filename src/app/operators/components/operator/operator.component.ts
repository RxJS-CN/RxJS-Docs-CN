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
import { pluck } from 'rxjs/operators';

export const OPERATOR_TOKEN = new InjectionToken<string>('operators');

@Component({
  selector: 'app-operator',
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.scss']
})
export class OperatorComponent implements OnInit {
  public operator: OperatorDoc;
  public operatorsMap = new Map<string, OperatorDoc>();

  private readonly baseSourceUrl = 'https://github.com/ReactiveX/rxjs/blob/master/src/operators/';
  private readonly baseSpecUrl = 'http://reactivex.io/rxjs/test-file/spec-js/operators';

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    @Inject(OPERATOR_TOKEN) public operators: OperatorDoc[],
    private _seo: SeoService
  ) {}

  ngOnInit() {
    this.operators.forEach((op: OperatorDoc) => {
      this.operatorsMap.set(op.name, op);
    });
    this._activatedRoute.params
      .pipe(pluck('operator'))
      .subscribe((name: string) => {
        if (this.operatorsMap.has(name)) {
          this.operator = this.operatorsMap.get(name);
          this.scrollToTop();
        } else {
          this.notfound();
          return;
        }
        this._seo.setHeaders({
          title: [this.operator.name, this.operator.operatorType],
          description: this.operator.shortDescription
            ? this.operator.shortDescription.description
            : ''
        });
      });
  }

  scrollToTop() {
    const content = document.querySelector('.mat-drawer-content');

    if (content) {
      content.scrollTop = 0;
    }
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
