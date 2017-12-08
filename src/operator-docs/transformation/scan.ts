import { OperatorDoc } from '../operator.model';

export const scan: OperatorDoc = {
  name: 'scan',
  operatorType: 'transformation',
  signature: 'public scan(accumulator: Function, seed: any): Observable',
  parameters: [
    {
      name: 'accumulator',
      type: '(acc: R, value: T, index: number) => R',
      attribute: '',
      description: 'The accumulator function called on each source value.'
    },
    {
      name: 'seed',
      type: 'T|R',
      attribute: 'optional',
      description: 'The initial accumulation value.'
    }
  ],
  useInteractiveMarbles: true,
  marbleUrl: 'http://reactivex.io/rxjs/img/scan.png',
  shortDescription: {
    description: `
          Applies an <span class="markdown-code">accumulator</span> function over the source Observable, and
          returns each intermediate result, with an optional <span class="markdown-code">seed</span> value.
      `,
    extras: []
  },
  walkthrough: {
    description: `
          <p>
              Combines together all values emitted on the source, using an accumulator
              function that knows how to join a new source value into the accumulation from
              the past. Is similar to <a href="/operators/reduce" class="markdown-code">reduce</a>, but emits the
              intermediate accumulations.
          </p>
          <p>
              Returns an Observable that applies a specified <span class="markdown-code">accumulator</span> function to each
              item emitted by the source Observable. If a <span class="markdown-code">seed</span> value is specified, then
              that value will be used as the initial value for the accumulator. If no seed value is specified,
              the first item of the source is used as the seed.
          </p>
      `
  },
  examples: [
    {
      name: 'Count the number of click events',
      code: `
              let clicks = Rx.Observable.fromEvent(document, 'click');
              let ones = clicks.mapTo(1);
              let seed = 0;
              let count = ones.scan((acc, one) => acc + one, seed);
              count.subscribe(x => console.log(x));
          `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/qemuzufofo/embed?js,console,output'
      }
    }
  ],
  relatedOperators: ['expand', 'mergeScan', 'reduce'],
  additionalResources: []
};
