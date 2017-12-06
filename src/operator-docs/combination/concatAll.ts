import { OperatorDoc } from '../operator.model';

export const concatAll: OperatorDoc = {
  name: 'concatAll',
  operatorType: 'combination',
  signature: 'public concatAll(): Observable',
  parameters: [],
  marbleUrl: 'http://reactivex.io/rxjs/img/concatAll.png',
  shortDescription: {
    description:
      'Converts a higher-order Observable into a first-order Observable by concatenating the inner Observables in order.',
    extras: [
      {
        type: 'Tip',
        text:
          'Flattens an Observable-of-Observables by putting one inner Observable after the other.'
      }
    ]
  },
  walkthrough: {
    description: `
      Joins every Observable emitted by the source (a higher-order Observable), in a serial fashion.
      It subscribes to each inner Observable only after the previous inner Observable has completed,
      and merges all of their values into the returned observable.
    `,
    extras: [
      {
        type: 'Warning',
        text: `
        If the source Observable emits Observables quickly and endlessly, and the inner Observables it emits generally
        complete slower than the source emits, you can run into memory issues as the incoming Observables collect in an unbounded buffer.
      `
      },
      {
        type: 'Tip',
        text: `concatAll is equivalent to mergeAll with concurrency parameter set to 1.`
      }
    ]
  },
  examples: [
    {
      name:
        'For each click event, tick every second from 0 to 3, with no concurrency',
      code: `
        const clicks = Rx.Observable.fromEvent(document, 'click');
        const higherOrder = clicks.map(ev => Rx.Observable.interval(1000).take(4));
        const firstOrder = higherOrder.concatAll();
        firstOrder.subscribe(x => console.log(x));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/guhefeyahi/embed?js,console,output'
      }
    }
  ],
  relatedOperators: [
    'combineAll',
    'concat',
    'concatMap',
    'concatMapTo',
    'exhaust',
    'mergeAll',
    'switch',
    'zipAll'
  ],
  additionalResources: []
};
