import { OperatorDoc } from '../operator.model';

export const windowOperator: OperatorDoc = {
  name: 'window',
  operatorType: 'transformation',
  signature:
    'public window(windowBoundaries: Observable<any>): Observable<Observable<T>>',
  parameters: [
    {
      name: 'windowBoundaries',
      type: 'Observable<any>',
      attribute: '',
      description:
        'An Observable that completes the previous window and starts a new window.'
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/window.png',
  shortDescription: {
    description: `
      Branch out the source Observable values as a nested Observable
      whenever <span class="markdown-code">windowBoundaries</span> emits.
    `,
    extras: [
      {
        type: 'Tip',
        text: `
          It's like  <a href="#/operators/buffer" class="markdown-code">buffer</a>,
          but emits a nested Observable instead of an array.
        `
      }
    ]
  },
  walkthrough: {
    description: `
      <p>
        Returns an Observable that emits windows of items it collects
        from the source Observable. The output Observable emits connected,
        non-overlapping windows. It emits the current window and opens a new
        one whenever the Observable <span class="markdown-code">windowBoundaries</span>
        emits an item. Because each window is an Observable, the output is a higher-order Observable.
      </p>
    `
  },
  examples: [
    {
      name: 'In every window of 1 second each, emit at most 2 click events',
      code: `
        const clicks = Rx.Observable.fromEvent(document, 'click');
        const interval = Rx.Observable.interval(1000);
        const result = clicks.window(interval)
          .map(win => win.take(2)) // each window has at most 2 emissions
          .mergeAll(); // flatten the Observable-of-Observables
        result.subscribe(x => console.log(x));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/racefub/embed?js,console,output'
      }
    }
  ],
  relatedOperators: [
    'windowCount',
    'windowTime',
    'windowToggle',
    'windowWhen',
    'buffer'
  ]
};
