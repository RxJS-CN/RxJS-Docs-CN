import { OperatorDoc } from '../operator.model';

export const combineAll: OperatorDoc = {
  name: 'combineAll',
  operatorType: 'combination',
  signature: 'public combineAll(project: function): Observable',
  parameters: [
    {
      name: 'project',
      type: 'function',
      attribute: 'optional',
      description: `An optional function to map the most recent values from each inner Observable into a new result.
      Takes each of the most recent values from each collected inner Observable as arguments, in order.`
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/combineAll.png',
  shortDescription: {
    description: `
      Flattens an Observable-of-Observables by applying <a href="/#/operators/combineLatest" class="markdown-code">combineLatest</a>
      when the Observable-of-Observables completes.`,
    extras: []
  },
  walkthrough: {
    description: `
      <p>
        Takes an Observable of Observables, and collects all Observables from it.
        Once the outer Observable completes, it subscribes to all collected
        Observables and combines their values using the <a href="/#/operators/combineLatest" class="markdown-code">combineLatest</a>
        strategy, such that:
      </p>
      <ul>
        <li>Every time an inner Observable emits, the output Observable emits.</li>
        <li>When the returned observable emits, it emits all of the latest values by:
          <ul>
            <li>
              If a <span class="markdown-code">project</span> function is provided, it is called with each recent value
              from each inner Observable in whatever order they arrived, and the result
              of the <span class="markdown-code">project</span> function is what is emitted by the output Observable.
            </li>
            <li>
              If there is no <span class="markdown-code">project</span> function, an array of all of the most recent
              values is emitted by the output Observable.
            </li>
          </ul>
        </li>
      </ul>
    `
  },
  examples: [
    {
      name:
        'Map two click events to a finite interval Observable, then apply <span class="markdown-code">combineAll</span>',
      code: `
        const clicks = Rx.Observable.fromEvent(document, 'click');
        const higherOrder = clicks.map(ev =>
          Rx.Observable.interval(Math.random()*2000).take(3)
        )
        .take(2);
        const result = higherOrder.combineAll();
        result.subscribe(x => console.log(x));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/peparawuvo/1/embed?js,console,output'
      }
    }
  ],
  relatedOperators: ['combineLatest', 'mergeAll'],
  additionalResources: []
};
