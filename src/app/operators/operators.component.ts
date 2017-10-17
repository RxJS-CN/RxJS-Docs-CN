import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { ALL_OPERATORS } from '../../operator-docs';
import { OperatorDoc } from '../../operator-docs/operator.model';

const OPERATOR_MENU_GAP_LARGE = 64;
const OPERATOR_MENU_GAP_SMALL = 54;

@Component({
  selector: 'app-operators',
  templateUrl: './operators.component.html',
  styleUrls: ['./operators.component.scss'],
  animations: [
    trigger('growInOut', [
      state('in', style({opacity: 1})),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'scale3d(.3, .3, .3)'
        }),
        animate(`150ms ease-in`)
      ]),
      transition('* => void', [
        animate(`150ms ease-out`, style({
          opacity: 0,
          transform: 'scale3d(.3, .3, .3)'
        }))
      ])
    ])
  ]
})
export class OperatorsComponent implements OnInit, AfterViewInit {
  public operators = ALL_OPERATORS;
  public groupedOperators = groupOperatorsByType(ALL_OPERATORS);
  public categories = Object.keys(this.groupedOperators);

  private _subscription: Subscription;

  constructor(
    private _breakpointObserver: BreakpointObserver,
    private _router: Router,
    private _activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this._subscription = this._activatedRoute
      .fragment
      .subscribe(name => this.scrollToOperator(name));
  }

  ngAfterViewInit() {
    // scroll initial param when applicable
    const name = this._activatedRoute.snapshot.fragment;

    if (name) {
      // slight delay for scroll to be accurate
      setTimeout(() => this.scrollToOperator(name), 100);
    }
  }

  updateUrl(name: string) {
    this._router.navigate([ '/operators' ], { fragment: name });
  }

  scrollToOperator(name: string) {
    const element = document.getElementById(name);

    if (element) {
      element.scrollIntoView();
    }
  }

  get extraSmallScreen() {
    return this._breakpointObserver.isMatched('(max-width: 601px)');
  }

  get smallScreen() {
    return this._breakpointObserver.isMatched('(max-width: 901px)');
  }

  get operatorMenuGap() {
    return this.extraSmallScreen ? OPERATOR_MENU_GAP_SMALL : OPERATOR_MENU_GAP_LARGE;
  }

  get sidenavMode() {
    return this.smallScreen ? 'over' : 'side';
  }

}

export function groupOperatorsByType(operators: OperatorDoc[]) {
  return operators.reduce((acc, curr) => {
    if (acc[curr.operatorType]) {
      return { ...acc, [ curr.operatorType ] : [ ...acc[ curr.operatorType ], curr ] };
    }
    return { ...acc, [ curr.operatorType ]: [ curr ] };
  }, {});
}
