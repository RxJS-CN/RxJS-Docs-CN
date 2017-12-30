import { OperatorDoc } from '../operator.model';

export const single: OperatorDoc = {
  name: 'single',
  operatorType: 'filtering',
  signature: 'public single(predicate: Function): Observable<T>',
  parameters: [
    {
      name: 'predicate',
      type: 'Function',
      attribute: '',
      description:
        'A predicate function to evaluate items emitted by the source Observable.'
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/single.png',
  shortDescription: {
    description: `Returns an Observable that emits the single item emitted by the source Observable
       that matches a specified predicate, if that Observable emits one such item.
       If the source Observable emits more than one such item or no such items, notify of an IllegalArgumentException
       or NoSuchElementException respectively.`
  },
  examples: [
    {
      name: 'Emit first number passing predicate',
      code: `
      //emit (1,2,3,4,5)
      const source = Rx.Observable.from([1, 2, 3, 4, 5]);
      //emit one item that matches predicate
      const example = source.single(val => val === 4);
      //output: 4
      const subscribe = example.subscribe(val => console.log(val));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/solecibuza/embed?js,console'
      }
    }
  ]
};
