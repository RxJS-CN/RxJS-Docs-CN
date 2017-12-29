import { OperatorDoc } from '../operator.model';

export const last: OperatorDoc = {
  name: 'last',
  operatorType: 'filtering',
  signature: 'public last(predicate: function): Observable',
  useInteractiveMarbles: true,
  parameters: [
    {
      name: 'predicate',
      type: 'function',
      attribute: '',
      description: 'The condition any source emitted item has to satisfy.'
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/last.png',
  shortDescription: {
    description: `Emits only the last value emitted by the source Observable.`
  },
  walkthrough: {
    description: `<p>
      <span class="markdown-code">last</span> Returns an Observable that emits only the last item emitted by the source Observable.
    </p>
    <p>
       It optionally takes a predicate function as a parameter,
       in which case, rather than emitting the last item from the source Observable,
       the resulting Observable will emit the last item from the source Observable that satisfies the predicate.
    </p>`
  },
  examples: [
    {
      name: 'Get the last number that is divisible by 3',
      code: `
      const range = Rx.Observable.range(1, 10);
      const last = range.last(x => x % 3 === 0);
      last.subscribe(x => console.log(x));
      // Logs below values
      // 9
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/reqacoselu/embed?html,js,console'
      }
    }
  ],
  relatedOperators: ['takeLast', 'first']
};
