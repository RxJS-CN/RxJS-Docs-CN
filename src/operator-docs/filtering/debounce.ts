import { OperatorDoc } from '../operator.model';

export const debounce: OperatorDoc = {
  name: 'debounce',
  operatorType: 'filtering',
  signature:
    'public debounce(durationSelector: function(value: T): SubscribableOrPromise): Observable',
  marbleUrl: 'http://reactivex.io/rxjs/img/debounce.png',
  parameters: [
    {
      name: 'durationSelector',
      type: 'function(value: T): SubscribableOrPromise',
      attribute: '',
      description: `A function that receives a value from the source Observable
        , for computing the timeout duration for each source value, returned as an Observable or a Promise.`
    }
  ],
  shortDescription: {
    description: `Emits a value from the source Observable only after a particular time span determined
       by another Observable has passed without another source emission.`,
    extras: [
      {
        type: 'Tip',
        text: `
        It's like debounceTime, but the time span of emission silence is determined by a second Observable.
        `
      }
    ]
  },
  walkthrough: {
    description: `
      <p>
        debounce delays values emitted by the source Observable,
        but drops previous pending delayed emissions if a new value arrives on the source Observable.
        This operator keeps track of the most recent value from the source Observable,
        and spawns a duration Observable by calling the durationSelector function.
        The value is emitted only when the duration Observable emits a value or completes,
        and if no other value was emitted on the source Observable since the duration Observable was spawned.
        If a new value appears before the duration Observable emits,
        the previous value will be dropped and will not be emitted on the output Observable.
      </p>
      <p>
      Like debounceTime, this is a rate-limiting operator, and also a delay-like operator
      since output emissions do not necessarily occur at the same time as they did on the source Observable.
      </p>
    `
  },
  examples: [
    {
      name: 'Emit the most recent click after a burst of clicks',
      code: `
        const clicks = Rx.Observable.fromEvent(document, 'click');
        const result = clicks.debounce(() => Rx.Observable.interval(1000));
        result.subscribe(x => console.log(x));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/zuyafikiqa/embed?js,console,output'
      }
    }
  ],
  relatedOperators: ['debounceTime', 'audit', 'delayWhen', 'throttle'],
  additionalResources: []
};
