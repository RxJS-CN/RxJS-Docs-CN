import { OperatorDoc } from '../operator.model';

export const sample: OperatorDoc = {
  name: 'sample',
  operatorType: 'filtering',
  signature: `public sample(notifier: Observable<any>): Observable<T>`,
  parameters: [
    {
      name: 'notifier',
      type: 'Observable<any>',
      attribute: '',
      description: 'The Observable to use for sampling the source Observable.'
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/sample.png',
  shortDescription: {
    description:
      'Emits the most recently emitted value from the source Observable whenever another Observable, the notifier, emits.',
    extras: [
      {
        type: 'Tip',
        text: `It's like sampleTime, but samples whenever the notifier Observable emits something.`
      }
    ]
  },
  walkthrough: {
    description: `
      <p>
       Whenever the notifier Observable emits a value or completes,
       sample looks at the source Observable and emits whichever value it has most recently emitted since the previous sampling,
       unless the source has not emitted anything since the previous sampling.
      </p>
      <p>
       The notifier is subscribed to as soon as the output Observable is subscribed.
      </p>
    `
  },
  examples: [
    {
      name: 'On every click, sample the value from source every 2 seconds',
      code: `
      //emit value every 1s
      const source = Rx.Observable.interval(1000);
      //sample last emitted value from source every 2s
      const example = source.sample(Rx.Observable.interval(2000));
      //output: 2..4..6..8..
      const subscribe = example.subscribe(val => console.log(val));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/gemebopifu/1/embed?js,console'
      }
    }
  ],
  relatedOperators: ['audit', 'debounce', 'sampleTime', 'throttle']
};
