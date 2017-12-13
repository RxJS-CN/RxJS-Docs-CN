import { OperatorDoc } from '../operator.model';

export const filter: OperatorDoc = {
  name: 'filter',
  operatorType: 'filtering',
  signature:
    'public filter(predicate: function(value: T, index: number): boolean, thisArg: any): Observable',
  parameters: [
    {
      name: 'predicate',
      type: 'function(value: T, index: number): boolean',
      attribute: '',
      description: `A function that evaluates each value emitted by the source Observable.
         If it returns true, the value is emitted, if false the value is not passed to the output Observable.
        The index parameter is the number i for the i-th source emission that has happened since the subscription,
         starting from the number 0.`
    },
    {
      name: 'thisArg',
      type: 'any',
      attribute: 'optional',
      description:
        'An optional argument to determine the value of this in the predicate function.'
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/filter.png',
  shortDescription: {
    description:
      'Filter items emitted by the source Observable by only emitting those that satisfy a specified predicate.',
    extras: [
      {
        type: 'Tip',
        text: `
        Like
        <a
         target="_blank"
         href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter">
          Array.prototype.filter()
        </a>,
        it only emits a value from the source if it passes a criterion function.
        `
      }
    ]
  },
  walkthrough: {
    description: `
      <p>
        Similar to the well-known <span class="markdown-code">Array.prototype.filter</span>
         method, this operator takes values from the source Observable,
         passes them through a predicate function and only emits those values that yielded true.
      </p>
    `
  },
  examples: [
    {
      name: 'Filter for even numbers',
      code: `
      //emit (1,2,3,4,5)
      const source = Rx.Observable.from([1, 2, 3, 4, 5]);
      //filter out non-even numbers
      const example = source.filter(num => num % 2 === 0);
      //output: "Even number: 2", "Even number: 4"
      const subscribe = example.subscribe(val => console.log('Even number: ' + val));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/vafogoluye/1/embed?js,console'
      }
    }
  ],
  relatedOperators: [
    'distinct',
    'distinctUntilChanged',
    'distinctUntilKeyChanged',
    'ignoreElements',
    'partition',
    'skip'
  ]
};
