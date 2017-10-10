import { OperatorDoc } from '../operator.model';

export const combineAll: OperatorDoc = {
  'name': 'combineAll',
  'operatorType': 'combination',
  'signature': 'public combineAll(project: function): Observable',
  'parameters': [
    {
      'name': 'project',
      'type': 'function',
      'attribute': 'optional',
      'description': 'An optional function to map the most recent values from each inner Observable into a new result. Takes each of the most recent values from each collected inner Observable as arguments, in order.'
    }
  ],
  'marbleUrl': 'http://reactivex.io/rxjs/img/combineAll.png',
  'shortDescription': {
    'description': 'Flattens an Observable-of-Observables by applying <a href="/operators#combineLatest" class="markdown-code">combineLatest</a> when the Observable-of-Observables completes.'
  },
  'longDescription': {
    'description': ''
  },
  'examples': [
    {
      'name': 'Map two click events to a finite interval Observable, then apply <span class="markdown-code">combineAll</span>',
      'code': `
        const clicks = Rx.Observable.fromEvent(document, 'click');
        const higherOrder = clicks.map(ev =>
          Rx.Observable.interval(Math.random()*2000).take(3)
        ).take(2);
        const result = higherOrder.combineAll();
        result.subscribe(x => console.log(x));
      `,
      'externalLinks': [
        { 'platform': 'JSBin', 'url': 'test'},
        { 'platform': 'JSFiddle', 'url': 'test'}
      ]
    }
  ],
  'relatedOperators': [ 'combineLatest', 'mergeAll' ],
  'additionalResources': [
    { 'description': 'combineAll Tests', 'url': 'http://reactivex.io/rxjs/test-file/spec-js/operators/combineAll-spec.js.html#lineNumber7' }
  ]
};
