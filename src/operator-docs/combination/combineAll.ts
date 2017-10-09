import { OperatorDoc } from '../operator.model';

export const combineAll: OperatorDoc = {
  'name': 'combineAll',
  'operatorType': 'combination',
  'signature': 'public combineAll(project: function): Observable',
  'marbleUrl': 'http://reactivex.io/rxjs/img/combineAll.png',
  'shortDescription': 'Flattens an Observable-of-Observables by applying <a href="/operators#combineLatest" class="markdown-code">combineLatest</a> when the Observable-of-Observables completes.',
  'examples': [
    {
      name: 'Map two click events to a finite interval Observable, then apply <span class="markdown-code">combineAll</span>',
      code: `
        const clicks = Rx.Observable.fromEvent(document, 'click');
        const higherOrder = clicks.map(ev =>
          Rx.Observable.interval(Math.random()*2000).take(3)
        ).take(2);
        const result = higherOrder.combineAll();
        result.subscribe(x => console.log(x));
      `,
      externalLinks: [
        { platform: 'JSBin', url: 'test'}
      ]
    }
  ],
  'relatedOperators': [ 'combineLatest', 'mergeAll' ]
};
