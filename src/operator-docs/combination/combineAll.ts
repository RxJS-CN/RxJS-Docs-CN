import { OperatorDoc } from '../operator.model';

export const combineAll: OperatorDoc = {
  "name": "combineAll",
  "operatorType": "combination",
  "signature": "public combineAll(project: function): Observable",
  "shortDescription": "Flattens an Observable-of-Observables by applying <a href='/operators#combineLatest'>combineLatest</a> when the Observable-of-Observables completes.",
  "examples": [
    {
      name: "Map two click events to a finite interval Observable, then apply combineAll",
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
  "relatedOperators": [ "combineLatest", "mergeAll" ]
};
