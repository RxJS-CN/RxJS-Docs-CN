import { OperatorDoc } from '../operator.model';

export const takeUntil: OperatorDoc = {
  name: 'takeUntil',
  operatorType: 'filtering',
  signature: 'public takeUntil(notifier: Observable): Observable<T>',
  useInteractiveMarbles: true,
  parameters: [
    {
      name: 'notifier',
      type: 'Observable',
      attribute: '',
      description: `The Observable whose first emitted value will cause the output Observable of takeUntil
      to stop emitting values from the source Observable.`
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/takeUntil.png',
  shortDescription: {
    description:
      'Emits the values emitted by the source Observable until a notifier Observable emits a value.',
    extras: [
      {
        type: 'Tip',
        text: `
          Lets values pass until a second Observable, notifier, emits something. Then, it completes.
        `
      }
    ]
  },
  walkthrough: {
    description: `
    <p>
      <code>takeUntil</code> subscribes and begins mirroring the source Observable.
    </p>
    <p>
      It also monitors a second Observable, notifier that you provide.
      If the notifier emits a value or a complete notification, the output Observable stops mirroring the source Observable and completes.
    </p>

    `
  },
  examples: [
    {
      name: 'Tick every second until the first click happens',
      code: `
      const interval = Rx.Observable.interval(1000);
      const clicks = Rx.Observable.fromEvent(document, 'click');
      const result = interval.takeUntil(clicks);
      result.subscribe(x => console.log(x));

      // Logs the number of seconds since the stream started.
      // Stream will end as soon as a click action is performed
      // anywhere in the document

      // 1
      // 2
      // 3
      // ...
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/rujeci/embed?html,js,console,output'
      }
    }
  ],
  relatedOperators: ['take', 'takeLast', 'takeWhile', 'skip']
};
