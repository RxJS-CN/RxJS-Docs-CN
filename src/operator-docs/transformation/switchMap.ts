import { OperatorDoc } from '../operator.model';

export const switchMap: OperatorDoc = {
  name: 'switchMap',
  operatorType: 'transformation',
  signature: `switchMap(project: (value: T, index: number) => ObservableInput<I>,
  resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): Observable`,
  parameters: [
    {
      name: 'project',
      type: 'function(value: T, index: number): ObservableInput',
      attribute: '',
      description: `A function that, when applied to an item emitted by the source
       Observable, returns an Observable.`
    },
    {
      name: 'resultSelector',
      type:
        'function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any',
      attribute: 'optional',
      description: `A function to produce the value on the output Observable based on the values
      and the indices of the source (outer) emission and the inner Observable
      emission. The arguments passed to this function are:
      - 'outerValue': the value that came from the source.
      - 'innerValue': the value that came from the projected Observable.
      - 'outerIndex': the "index" of the value that came from the source.
      - 'innerIndex': the "index" of the value from the projected Observable.`
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/switchMap.png',
  shortDescription: {
    description: `Projects each source value to an Observable which is merged in the output
    Observable, emitting values only from the most recently projected Observable.

    <span class="informal">Maps each value to an Observable, then flattens all of
    these inner Observables using <code>switch</code>.</span>`
  },
  walkthrough: {
    description: `Returns an Observable that emits items based on applying a function that you
    supply to each item emitted by the source Observable, where that function
    returns an (so-called "inner") Observable. Each time it observes one of these
    inner Observables, the output Observable begins emitting the items emitted by
    that inner Observable. When a new inner Observable is emitted, <code>switchMap</code>
    stops emitting items from the earlier-emitted inner Observable and begins
    emitting items from the new one. It continues to behave like this for
    subsequent inner Observables.`
  },
  examples: [
    {
      name: 'Rerun an interval Observable on every click even',
      code: `
      const clicks = Rx.Observable.fromEvent(document, 'click');
      const result = clicks.switchMap((ev) => Rx.Observable.interval(1000));
      result.subscribe(x => console.log(x));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/yehawof/edit?js,console,output'
      }
    }
  ],
  relatedOperators: [
    'concatMap',
    'exhaustMap',
    'mergeMap',
    'switch',
    'switchMapTo'
  ]
};
