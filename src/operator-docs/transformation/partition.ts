import { OperatorDoc } from '../operator.model';

export const partition: OperatorDoc = {
  name: 'partition',
  operatorType: 'transformation',
  signature:
    'public partition(predicate: function(value: T, index: number): boolean, thisArg: any): [Observable<T>, Observable<T>]',
  marbleUrl: 'http://reactivex.io/rxjs/img/partition.png',
  parameters: [
    {
      name: 'predicate',
      type: 'function(value: T, index: number): boolean',
      attribute: '',
      description: `A function that evaluates each value emitted by the source Observable. If it returns 'true', the value is emitted on the
      first Observable in the returned array, if 'false' the value is emitted on the second Observable in the array. The 'index' parameter
      is the number 'i' for the i-th source emission that has happened since the subscription, starting from the number '0'.`
    },
    {
      name: 'thisArg',
      type: 'any',
      attribute: 'optional',
      description: `An optional argument to determine the value of 'this' in the predicate function.`
    }
  ],
  shortDescription: {
    description: `Splits the source Observable into two, one with values that satisfy a predicate, and another with values
      that don't satisfy the predicate.`,
    extras: [
      {
        type: 'Tip',
        text: `
        It's like <a href="#/operators/filter" class="markdown-code">filter</a>, but returns two Observables: one like the output of
        <a href="#/operators/filter" class="markdown-code">filter</a>, and the other with values that did not pass the condition.
        `
      }
    ]
  },
  walkthrough: {
    description: `
      <p>
        <span class="markdown-code">partition</span> outputs an array with two Observables that partition the values from the source
        Observable through the given <span class="markdown-code">predicate</span> function. The first Observable in that array emits
        source values for which the predicate argument returns true. The second Observable emits source values for which the predicate
        returns false. The first behaves like <a href="#/operators/filter" class="markdown-code">filter</a> and the second behaves like
        <a href="#/operators/filter" class="markdown-code">filter</a> with the predicate negated.
      </p>
    `
  },
  examples: [
    {
      name:
        'Partition click events into those on DIV elements and those elsewhere',
      code: `
        const clicks = Rx.Observable.fromEvent(document, 'click');
        const parts = clicks.partition(ev => ev.target.tagName === 'DIV');
        const clicksOnDivs = parts[0];
        const clicksElsewhere = parts[1];
        clicksOnDivs.subscribe(x => console.log('DIV clicked: ', x));
        clicksElsewhere.subscribe(x => console.log('Other clicked: ', x));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/vekisov/embed?js,console,output'
      }
    }
  ],
  relatedOperators: ['filter'],
  additionalResources: []
};
