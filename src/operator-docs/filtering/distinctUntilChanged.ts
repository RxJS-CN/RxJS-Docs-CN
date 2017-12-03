import { OperatorDoc } from '../operator.model';

// ported from:
// http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-distinctUntilChanged

export const distinctUntilChanged: OperatorDoc = {
  name: 'distinctUntilChanged',
  operatorType: 'filtering',
  signature: 'public distinctUntilChanged(compare: function): Observable',
  useInteractiveMarbles: true,
  parameters: [
    {
      name: 'compare',
      type: 'function',
      attribute: 'optional',
      description:
        'Optional comparison function called to test if an item is distinct from the previous item in the source.'
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/distinctUntilChanged.png',
  shortDescription: {
    description: `
    Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from the previous item.
    `,
    extras: [
      {
        type: 'Tip',
        text: `
        <span class="markdown-code">distinctUntilChanged</span> uses
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness"
          target="_blank"
          class="markdown-code">
          ===
        </a> comparison by default.
       `
      }
    ]
  },
  walkthrough: {
    description: `
      <p>
        This operator will compare each emitted item from the source to the previously emitted item,
        emitting only distinct values by comparison such that:
      </p>
      <ul>
        <li>
         If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
        </li>
        <li>
          If a comparator function is not provided, an equality check is used by default.
        </li>
      </ul>
    `
  },
  examples: [
    {
      name: 'A simple example with numbers',
      code: `
      Rx.Observable.of(1, 1, 2, 2, 2, 1, 1, 2, 3, 3, 4)
       .distinctUntilChanged()
       .subscribe(x => console.log(x));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/poxayavuge/embed?js,console'
      }
    },
    {
      name: 'An example using a compare function',
      code: `
      Rx.Observable.of(
         { age: 4, name: 'Foo'},
         { age: 7, name: 'Bar'},
         { age: 5, name: 'Foo'},
         { age: 6, name: 'Foo'}
        )
        .distinctUntilChanged((p, q) => p.name === q.name)
        .subscribe(x => console.log(x));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/duhexuhoxo/embed?js,console'
      }
    }
  ],
  relatedOperators: [],
  additionalResources: []
};
