import { OperatorDoc } from '../operator.model';

export const from: OperatorDoc = {
  name: 'from',
  operatorType: 'creation',
  signature: `from(ish: ArrayLike | ObservableInput, scheduler: Scheduler): Observable`,
  parameters: [
    {
      name: 'ish',
      type: 'ArrayLike | ObservableInput',
      attribute: '',
      description: `A subscribable object, a Promise, an  Observable-like, an Array, an
	  iterable or an array-like object to be converted.`
    },
    {
      name: 'scheduler',
      type: 'Scheduler',
      attribute: 'optional',
      description: `The scheduler on which to schedule the emissions of values.`
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/from.png',
  shortDescription: {
    description: `Creates an Observable from an Array, an array-like object, a Promise, an
    iterable object, or an Observable-like object.
    <span class="informal">Converts almost anything to an Observable.</span>`
  },
  walkthrough: {
    description: `Converts various other objects and data types into Observables. <span class="markdown-code">from</span>
    converts a Promise or an array-like or an
    <a href ='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterable' target='_blank'>iterable</a>
    object into an Observable that emits the items in that promise or array or
    iterable. A String, in this context, is treated as an array of characters.
    Observable-like objects (contains a function named with the ES2015 Symbol
    for Observable) can also be converted through this operator.
   `
  },
  examples: [
    {
      name: 'Converts an array to an Observable',
      code: `
      const array = [10, 20, 30];
      const result = Rx.Observable.from(array);
      result.subscribe(x => console.log(x));

      // Results in the following:
      // 10 20 30`,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/qodocay/embed?js,console'
      }
    },
    {
      name: 'Convert an infinite iterable (from a generator) to an Observable',
      code: `
      function* generateDoubles(seed) {
        let i = seed;
        while (true) {
          yield i;
          i = 2 * i; // double it
        }
      }
      const iterator = generateDoubles(3);
      const result = Rx.Observable.from(iterator).take(10);
      result.subscribe(x => console.log(x));
      // Results in the following:
      // 3 6 12 24 48 96 192 384 768 1536`,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/kidevan/embed?js,console'
      }
    },
    {
      name:
        'Using <span class="markdown-code">from</span> with async scheduler',
      code: `
      console.log('start');
      const array = [10, 20, 30];
      const result = Rx.Observable.from(array, Rx.Scheduler.async);
      result.subscribe(x => console.log(x));
      console.log('end');
      // Results in the following:
      // start end 10 20 30`,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/xunesam/embed?js,console'
      }
    }
  ],
  relatedOperators: ['create', 'fromEvent', 'fromEventPattern', 'fromPromise']
};
