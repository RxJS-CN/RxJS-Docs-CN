import { OperatorDoc } from '../operator.model';

export const skip: OperatorDoc = {
  name: 'skip',
  operatorType: 'filtering',
  signature: 'public skip(count: Number): Observable',
  parameters: [
    {
      name: 'count',
      type: 'Number',
      attribute: '',
      description:
        'Returns an Observable that skips the first count items emitted by the source Observable.'
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/skip.png',
  shortDescription: {
    description:
      'Returns an Observable that skips the first count items emitted by the source Observable.'
  },
  examples: [
    {
      name: 'Skipping values before emission',
      code: `
      //emit every 1s
      const source = Rx.Observable.interval(1000);
      //skip the first 5 emitted values
      const example = source.skip(5);
      //output: 5...6...7...8........
      const subscribe = example.subscribe(val => console.log(val));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/hacepudabi/1/embed?js,console'
      }
    }
  ]
};
