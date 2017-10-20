import { OperatorDoc } from '../operator.model';

export const combineLatest: OperatorDoc = {
  'name': 'combineLatest',
  'operatorType': 'combination',
  'signature': 'public combineLatest(observables: ...Observable, project: function): Observable',
  "useInteractiveMarbles": true,
  'parameters': [
    {
      'name': 'other',
      'type': 'Observable',
      'attribute': '',
      'description': 'An input Observable to combine with the source Observable. More than one input Observables may be given as argument.'
    },
    {
      'name': 'other',
      'type': 'function',
      'attribute': 'optional',
      'description': 'An optional function to project the values from the combined latest values into a new value on the output Observable.'
    }
  ],
  'marbleUrl': 'http://reactivex.io/rxjs/img/combineLatest.png',
  'shortDescription': {
    'description': `
      Combines multiple Observables to create an Observable whose values
      are calculated from the latest values of each of its input Observables.
    `,
    'extras': []
  },
  'walkthrough': {
    'description': `
      <p>
        <span class="markdown-code">combineLatest</span> combines the values from this Observable with values from
        Observables passed as arguments. This is done by subscribing to each
        Observable, in order, and collecting an array of each of the most recent
        values any time any of the input Observables emits, then either taking that
        array and passing it as arguments to an optional <span class="markdown-code">project</span> function and
        emitting the return value of that, or just emitting the array of recent
        values directly if there is no <span class="markdown-code">project</span> function.
      </p>
    `
  },
  'examples': [
    {
      'name': 'Dynamically calculate the Body-Mass Index from an Observable of weight and one for height',
      'code': `
        const weight = Rx.Observable.of(70, 72, 76, 79, 75);
        const height = Rx.Observable.of(1.76, 1.77, 1.78);
        const bmi = weight.combineLatest(height, (w, h) => w / (h * h));
        /*
           Output:
           BMI is 24.212293388429753
           BMI is 23.93948099205209
           BMI is 23.671253629592222
        */
        bmi.subscribe(x => console.log('BMI is ' + x));
      `,
      'externalLink': { 'platform': 'JSBin', 'url': 'http://jsbin.com/pivowunedu/1/embed?js,console'}
    }
  ],
  'relatedOperators': [ 'combineAll', 'merge', 'withLatestFrom' ],
  'additionalResources': []
};
