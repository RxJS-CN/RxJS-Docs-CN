import { OperatorDoc } from '../operator.model';

export const empty: OperatorDoc = {
  name: 'empty',
  operatorType: 'creation',
  signature: 'public empty(scheduler?: IScheduler): Observable',
  parameters: [
    {
      name: 'scheduler',
      type: 'IScheduler',
      attribute: 'optional',
      description:
        'Allows scheduling the emission of the complete notification.'
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/empty.png',
  shortDescription: {
    description:
      'Creates an Observable that emits no items to the Observer' +
      ' and immediately emits a complete notification.'
  },
  walkthrough: {
    description: `This static operator is useful for creating a simple
       Observable that only emits the complete notification. It can be used for
       composing with other Observables`
  },
  examples: [
    {
      name: 'Observable completes immediately',
      code: `const observable = Rx.Observable.empty();
             const subscription = observable.subscribe({
               next: () => console.log('next'), // does not log anything
               complete: () => console.log('complete'), // logs 'complete'
             });`,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/hojacunecu/1/embed?js,console,output'
      }
    },
    {
      name: 'Observable emits initial value then completes',
      code: `const observable = Rx.Observable.empty().startWith('initial value');
             const subscription = observable.subscribe({
               next: (val) => console.log(\`next: \${val}\`), // logs 'next: initial value'
               complete: () => console.log('complete'), // logs 'complete'
             });`,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/tubonoradi/1/embed?js,console,output'
      }
    },
    {
      name: `Map and flatten only odd numbers to the sequence 'ax', 'bx', 'cx'`,
      code: `const source = Rx.Observable.of(1, 2, 3, 4, 5, 6, 7, 8, 9);
             const result = source.mergeMap(
               x => x % 2 === 1 ? Rx.Observable.of(\`a\${x}\`, \`b\${x}\`, \`c\${x}\`) :
                                  Rx.Observable.empty()
             );
             const subscription = result.subscribe({
               next: (x) => console.log(x), // logs result values
               complete: () => console.log('complete'), // logs 'complete'
             });`,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/qazabojiri/embed?js,console,output'
      }
    }
  ],
  relatedOperators: ['create', 'of', 'throw']
};
