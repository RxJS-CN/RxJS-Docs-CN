import { OperatorDoc } from '../operator.model';

export const throttle: OperatorDoc = {
  name: 'throttle',
  operatorType: 'filtering',
  signature:
    'public throttle(durationSelector: function(value: T): SubscribableOrPromise): Observable<T>',
  parameters: [
    {
      name: 'durationSelector',
      type: 'function(value: T): SubscribableOrPromise',
      attribute: '',
      description: `
        A function that receives a value from the source Observable, for computing the silencing duration for each source value,
         returned as an Observable or a Promise.
      `
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/throttle.png',
  shortDescription: {
    description: `Emits a value from the source Observable, then ignores subsequent source values for a duration
     determined by another Observable, then repeats this process.`,
    extras: [
      {
        type: 'Tip',
        text: `It's like throttleTime, but the silencing duration is determined by a second Observable.`
      }
    ]
  },
  walkthrough: {
    description: `
    <p>
      <code>throttle</code> emits the source Observable values on the output Observable when its internal timer is disabled,
       and ignores source values when the timer is enabled. Initially, the timer is disabled.
    </p>
    <p>
      As soon as the first source value arrives, it is forwarded to the output Observable,
      and then the timer is enabled by calling the durationSelector function with the source value,
      which returns the "duration" Observable.
    </p>
    <p>
      When the duration Observable emits a value or completes,
      the timer is disabled, and this process repeats for the next source value.
    </p>
    `
  },
  examples: [
    {
      name:
        'Emit X position of mouse click at a rate of at most one click per second',
      code: `
      const clicks = Rx.Observable.fromEvent(document, 'click');
      const result = clicks.throttle(ev => Rx.Observable.interval(1000));
      result.subscribe(x => console.log(x.clientX));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/wojifil/embed?js,console,output'
      }
    }
  ],
  relatedOperators: ['audit', 'debounce', 'delayWhen', 'sample', 'throttleTime']
};
