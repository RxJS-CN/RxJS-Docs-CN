import { OperatorDoc } from '../operator.model';

export const mergeAll: OperatorDoc = {
  name: 'mergeAll',
  operatorType: 'combination',
  signature: 'public mergeAll(concurrent: number): Observable',
  parameters: [
    {
      name: 'concurrent',
      type: 'number',
      attribute: 'optional, default: Number.POSITIVE_INFINITY',
      description: `Maximum number of input Observables being subscribed to concurrently.`
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/mergeAll.png',
  shortDescription: {
    description: `Converts a higher-order Observable into a first-order Observable which concurrently
     delivers all values that are emitted on the inner Observables`,
    extras: [
      {
        type: 'Tip',
        text: 'Flattens an Observable-of-Observables.'
      }
    ]
  },
  walkthrough: {
    description: `
      <p><span class="markdown-code">MergeAll</span> subscribes to an Observable that emits Observables,
        also known as a higher-order Observable. Each time it observes one of these emitted
        inner Observables, it subscribes to that and delivers all the values from the inner
        Observable on the output Observable. The output Observable only completes once all inner
        Observables have completed. Any error delivered by a inner Observable will be immediately
        emitted on the output Observable.</p>
    `
  },
  examples: [
    {
      name:
        'Spawn a new interval Observable for each click event, and blend their outputs as one Observable',
      code: `
        const clicks = Rx.Observable.fromEvent(document, 'click');
        const higherOrder = clicks.map((ev) => Rx.Observable.interval(1000));
        const firstOrder = higherOrder.mergeAll();
        firstOrder.subscribe(x => console.log(x));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/lebidefocu/1/embed?js,output'
      }
    },
    {
      name:
        'Count from 0 to 9 every second for each click, but only allow 2 concurrent timers',
      code: `
        const clicks = Rx.Observable.fromEvent(document, 'click');
        const higherOrder = clicks.map((ev) => Rx.Observable.interval(1000).take(10));
        const firstOrder = higherOrder.mergeAll(2);
        firstOrder.subscribe(x => console.log(x));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/kokezoribu/embed?js,output'
      }
    }
  ],
  relatedOperators: [
    'combineAll',
    'concatAll',
    'exhaust',
    'merge',
    'mergeMap',
    'mergeMapTo',
    'mergeScan',
    'switch',
    'zipAll'
  ]
};
