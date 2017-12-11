import { OperatorDoc } from '../operator.model';

export const take: OperatorDoc = {
  name: 'take',
  operatorType: 'filtering',
  signature: 'public take(count: number): Observable<T>',
  useInteractiveMarbles: true,
  parameters: [
    {
      name: 'count',
      type: 'number',
      attribute: '',
      description: 'The maximum number of next values to emit.'
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/take.png',
  shortDescription: {
    description: `Emits only the first count values emitted by the source Observable.`,
    extras: [
      {
        type: 'Tip',
        text: `Takes the first count values from the source, then completes.`
      }
    ]
  },
  walkthrough: {
    description: `<p>
      <span class="markdown-code">take</span> returns an Observable that emits only the first count values emitted by the source Observable.
    </p>
    <p>
      If the source emits fewer than count values then all of its values are emitted.
      After that, it completes, regardless if the source completes.
    </p>`
  },
  examples: [
    {
      name:
        'Take the first 5 seconds of an infinite 1-second interval Observable',
      code: `
      const interval = Rx.Observable.interval(1000);
      const five = interval.take(5);
      five.subscribe(x => console.log(x));
      // Logs below values
      // 0
      // 1
      // 2
      // 3
      // 4
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/yujema/embed?html,js,console'
      }
    }
  ],
  relatedOperators: ['takeLast', 'takeUntil', 'takeWhile', 'skip']
};
