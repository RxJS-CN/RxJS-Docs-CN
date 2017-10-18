import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LayoutModule, BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs/Observable';
import { OperatorsComponent, OPERATORS_TOKEN, groupOperatorsByType } from '../operators.component';
import { OperatorDoc } from '../../../operator-docs';

const mockActivatedRoute = {
  snapshot: {},
  fragment: Observable.create(observer => {
    observer.next('merge');
    observer.complete();
  })
};

const mockOperators: OperatorDoc[] = [
  { operatorType: 'transformation' },
  { operatorType: 'utility' },
  { operatorType: 'utility' }
];

const mockBreakPointObserver = {
  isMatched: () => {}
};

describe('Operators', () => {
  describe('OperatorsComponent', () => {
    let fixture: ComponentFixture<OperatorsComponent>;
    let component: OperatorsComponent;
    let el;
    let breakpointService: BreakpointObserver;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ RouterTestingModule, LayoutModule ],
        declarations: [ OperatorsComponent ],
        providers: [
          { provide: OPERATORS_TOKEN, useValue: mockOperators },
          { provide: ActivatedRoute, useValue: mockActivatedRoute }
        ],
        schemas: [ NO_ERRORS_SCHEMA ]
      });
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(OperatorsComponent);
      component = fixture.componentInstance;
      el = fixture.debugElement;
      breakpointService = el.injector.get(BreakpointObserver);
    });

    it('should group operators by operator type', () => {
      component.ngOnInit();

      expect(component.groupedOperators['transformation'].length).toBe(1);
      expect(component.groupedOperators['utility'].length).toBe(2);
    });

    it('should scroll to initial operator when fragment exists', () => {
      spyOn(component, 'scrollToOperator').and.stub();
      component.ngOnInit();

      expect(component.scrollToOperator).toHaveBeenCalledWith('merge');
    });

    it('should have a sidenav mode of over when on a small screen', () => {
      spyOn(breakpointService, 'isMatched').and.returnValue(true);

      expect(component.sidenavMode).toBe('over');
    });

    it('should have a sidenav mode of side when on a large screen', () => {
      spyOn(breakpointService, 'isMatched').and.returnValue(false);

      expect(component.sidenavMode).toBe('side');
    });

    it('should have a top menu gap of 54px when on a small screen', () => {
      // small screen
      spyOn(breakpointService, 'isMatched').and.returnValue(true);

      expect(component.operatorMenuGap).toBe(54);
    });

    it('should have a top menu gap of 64px when on a large screen', () => {
      spyOn(breakpointService, 'isMatched').and.returnValue(false);

      expect(component.operatorMenuGap).toBe(64);
    });
  });
});
