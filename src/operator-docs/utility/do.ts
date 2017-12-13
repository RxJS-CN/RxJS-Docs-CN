import { OperatorDoc } from '../operator.model';

export const doOperator: OperatorDoc = {
  name: 'do',
  operatorType: 'utility',
  signature:
    'public do(nextOrObserver: Observer | function, error: function, complete: function): Observable',
  parameters: [
    {
      name: 'nextOrObserver',
      type: 'Observer|function',
      attribute: 'optional',
      description: 'A normal Observer object or a callback for `next`.'
    },
    {
      name: 'error',
      type: 'function',
      attribute: 'optional',
      description: 'Callback for errors in the source.'
    },
    {
      name: 'complete',
      type: 'function',
      attribute: 'optional',
      description: 'Callback for the completion of the source.'
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/do.png',
  shortDescription: {
    description: `Perform a side effect for every emission on the source Observable, but return
      an Observable that is identical to the source.
      <span class="informal">Intercepts each emission on the source and runs a
      function, but returns an output which is identical to the source as long as errors don't
      occur.</span>`
  },
  walkthrough: {
    description: `
      <p>Returns a mirrored Observable of the source Observable,
      but modified so that the provided Observer is called to perform a side effect for every
      value, error, and completion emitted by the source. Any errors that are thrown in
      the aforementioned Observer or handlers are safely sent down the error path
      of the output Observable.
      </p>
      <p>
      This operator is useful for debugging your Observables for the correct values
      or performing other side effects.
      </p>
      <p>
      Note: this is different to a <span class="markdown-code">subscribe</span> on the Observable. If the Observable
      returned by <span class="markdown-code">do</span> is not subscribed, the side effects specified by the
      Observer will never happen. <span class="markdown-code">do</span> therefore simply spies on existing
      execution, it does not trigger an execution to happen like <span class="markdown-code">subscribe</span> does.</p>
    `
  },
  examples: [
    {
      name:
        'Map every click to the clientX position of that click, while also logging the click event',
      code: `
      const clicks = Rx.Observable.fromEvent(document, 'click');
      const positions = clicks
         .do(ev => console.log(ev.type))
         .map(ev => ev.clientX);
      positions.subscribe(x => console.log(x));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/pijosapixu/embed?js,console,output'
      }
    }
  ],
  relatedOperators: ['map', 'subscribe']
};
