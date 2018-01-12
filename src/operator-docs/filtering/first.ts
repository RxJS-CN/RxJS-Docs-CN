import { OperatorDoc } from '../operator.model';

export const first: OperatorDoc = {
  name: 'first',
  operatorType: 'filtering',
  signature: `public first(predicate: function(value: T, index: number, source: Observable<T>):
   boolean, resultSelector: function(value: T, index: number): R, defaultValue: R): Observable<T | R>`,
  parameters: [
    {
      name: 'predicate',
      type:
        'function(value: T, index: number, source: Observable<T>): boolean	',
      attribute: 'optional',
      description:
        'An optional function called with each item to test for condition matching.'
    },
    {
      name: 'resultSelector',
      type: 'function(value: T, index: number): R',
      attribute: 'optional',
      description: `
       A function to produce the value on the output Observable based on the
        values and the indices of the source Observable. The arguments passed to this function are:
       value: the value that was emitted on the source.
       index: the "index" of the value from the source.
       `
    },
    {
      name: 'defaultValue',
      type: 'R',
      attribute: 'optional',
      description:
        'The default value emitted in case no valid value was found on the source.'
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/first.png',
  shortDescription: {
    description: `Emits only the first value (or the first value that meets some condition) emitted by the source Observable.`,
    extras: [
      {
        type: 'Tip',
        text: `Emits only the first value. Or emits only the first value that passes some test.`
      }
    ]
  },
  walkthrough: {
    description: `
     <p>
      If called with no arguments, first emits the first value of the source Observable, then completes.
     </p>
     <p>
      If called with a <span class="markdown-code">predicate</span> function,
      <span class="markdown-code>first</code> emits the first value of the source that matches the specified condition.
     </p>
     <p>
       It may also take a <span class="markdown-code">resultSelector</span> function to produce the output value from the input value,
       and a <span class="markdown-code">defaultValue</span> to emit in case the source completes before it is able to emit a valid value.
     </p>
     <p>
       Throws an error if defaultValue was not provided and a matching element is not found.
     </p>
     `
  },
  examples: [
    {
      name: 'Emit only the X postition of first click that happens on the DOM',
      code: `
       const clicks = Rx.Observable.fromEvent(document, 'click');
       const result = clicks.first();
       result.subscribe(x => console.log(x));
       `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/zixuweg/1/embed?html,js,console,output'
      }
    },
    {
      name: 'Emits only the X postition of first click that happens on a DIV',
      code: `
       const clicks = Rx.Observable.fromEvent(document, 'click');
       const result = clicks.first(ev => ev.target.tagName === 'DIV');
       result.subscribe(x => console.log(x));
       `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/yuwebew/1/embed?js,console,output'
      }
    }
  ]
};
