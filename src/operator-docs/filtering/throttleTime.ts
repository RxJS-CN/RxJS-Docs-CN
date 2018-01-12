import { OperatorDoc } from '../operator.model';

export const throttleTime: OperatorDoc = {
  name: 'throttleTime',
  operatorType: 'filtering',
  signature:
    'public throttleTime(duration: number, scheduler: Scheduler): Observable<T>',
  parameters: [
    {
      name: 'duration',
      type: 'number',
      attribute: '',
      description: `Time to wait before emitting another value after emitting the last value,
         measured in milliseconds or the time unit determined internally by the optional scheduler.`
    },
    {
      name: 'scheduler',
      type: 'Scheduler',
      attribute: 'optional default:sync',
      description:
        'The IScheduler to use for managing the timers that handle the sampling.'
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/throttleTime.png',
  shortDescription: {
    description: `Emits a value from the source Observable,
        then ignores subsequent source values for duration milliseconds, then repeats this process.`,
    extras: [
      {
        type: 'Tip',
        text: `
          Lets a value pass, then ignores source values for the next duration milliseconds.
        `
      }
    ]
  },
  walkthrough: {
    description: `
    <p>
      throttleTime emits the source Observable values on the output Observable when its internal timer is disabled,
       and ignores source values when the timer is enabled. Initially, the timer is disabled.
    </p>
    <p>
      As soon as the first source value arrives, it is forwarded to the output Observable, and then the timer is enabled.
    </p>
    <p>
      After duration milliseconds (or the time unit determined internally by the optional scheduler) has passed, the timer is disabled,
      and this process repeats for the next source value. Optionally takes a IScheduler for managing timers.
    </p>
    `
  },
  examples: [
    {
      name:
        'Emit X position of mouse clicks at a rate of at most one click per second',
      code: `
      const clicks = Rx.Observable.fromEvent(document, 'click');
      const result = clicks.throttleTime(1000);
      result.subscribe(x => console.log(x.clientX));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/nefefeb/embed?js,console,output'
      }
    }
  ],
  relatedOperators: [
    'auditTime',
    'debounceTime',
    'delay',
    'sampleTime',
    'throttle'
  ]
};
