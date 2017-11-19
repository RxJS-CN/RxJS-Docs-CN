import { OperatorDoc } from '../operator.model';

export const debounceTime: OperatorDoc = {
  name: 'debounceTime',
  operatorType: 'filtering',
  signature:
    'public debounceTime<T>(dueTime: number, scheduler: IScheduler = async): Observable',
  parameters: [
    {
      name: 'dueTime',
      type: 'number',
      attribute: 'mandatory',
      description: `The timeout duration in milliseconds
      (or the time unit determined internally by the optional scheduler) for the window of time required to
      wait for emission silence before emitting the most recent source value.`
    },
    {
      name: 'scheduler',
      type: 'IScheduler',
      attribute: 'optional',
      description: `The IScheduler to use for managing the timers that handle the timeout for each value.`
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/debounceTime.png',
  shortDescription: {
    description: `
    Emits a value from the source Observable only after a particular time span has passed without another source emission.
    It's like <a class="markdown-code" href="/operators/delay">delay</a>
    , but passes only the most recent value from each burst of emissions.`,
    extras: []
  },
  walkthrough: {
    description: `
      <p>
      <span class="markdown-code">debounceTime</span> delays values emitted by the source Observable, but drops
      previous pending delayed emissions if a new value arrives on the source
      Observable. This operator keeps track of the most recent value from the
      source Observable, and emits that only when <span class="markdown-code">dueTime</span> enough time has passed
      without any other value appearing on the source Observable. If a new value
      appears before <span class="markdown-code">dueTime</span> silence occurs, the previous value will be dropped
      and will not be emitted on the output Observable.
      </p>
      <p>
        This is a rate-limiting operator, because it is impossible for more than one
        value to be emitted in any time window of duration <span class="markdown-code">dueTime</span>, but it is also
        a delay-like operator since output emissions do not occur at the same time as
        they did on the source Observable. Optionally takes a <span class="markdown-code">IScheduler</span> for
        managing timers.
      </p>
    `
  },
  examples: [
    {
      name:
        'Emit the most recent value after a burst of value changes over a defined time',
      code: `
        const search = document.querySelector('#search');
        const output = document.querySelector('#output');
        const searchChange$ = Rx.Observable.fromEvent(search, 'keyup');

        searchChange$
        .map(x => x.target.value)
        .debounceTime(500)
          .subscribe((search)=> output.textContent=search);
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/gapobakuwu/edit?js,output'
      }
    }
  ],
  relatedOperators: [
    'auditTime',
    'debounce',
    'delay',
    'sampleTime',
    'throttleTime'
  ],
  additionalResources: []
};
