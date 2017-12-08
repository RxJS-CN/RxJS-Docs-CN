import { OperatorDoc } from '../operator.model';

export const merge: OperatorDoc = {
  name: 'merge',
  operatorType: 'combination',
  signature:
    'public merge(other: ObservableInput, concurrent: number, scheduler: Scheduler): Observable',
  parameters: [
    {
      name: 'other',
      type: 'ObservableInput',
      attribute: '',
      description: `An input Observable to merge with the source Observable. More than one input
       Observables may be given as argument.`
    },
    {
      name: 'concurrent',
      type: 'number',
      attribute: 'optional, default: Number.POSITIVE_INFINITY',
      description: `Maximum number of input Observables being subscribed to concurrently.`
    },
    {
      name: 'scheduler',
      type: 'Scheduler',
      attribute: 'optional, default: null',
      description: `The IScheduler to use for managing concurrency of input Observables.`
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/merge.png',
  shortDescription: {
    description: `Creates an output Observable which concurrently emits all values
      from every given input Observable. <span class="informal">Flattens multiple Observables
      together by blending their values into one Observable.</span>`
  },
  walkthrough: {
    description: `
      <p><span class="markdown-code">Merge</span> subscribes to each given input Observable (either the source or an
      Observable given as argument), and simply forwards (without doing any
      transformation) all the values from all the input Observables to the output
      Observable. The output Observable only completes once all input Observables
      have completed. Any error delivered by an input Observable will be immediately
      emitted on the output Observable.</p>
    `
  },
  examples: [
    {
      name: 'Merge together two Observables: 1s interval and clicks',
      code: `
        const clicks = Rx.Observable.fromEvent(document, 'click');
        const timer = Rx.Observable.interval(1000);
        const clicksOrTimer = clicks.merge(timer);
        clicksOrTimer.subscribe(x => console.log(x));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/wihafapiva/1/embed?js,output'
      }
    },
    {
      name: 'Merge together 3 Observables, but only 2 run concurrently',
      code: `
        const timer1 = Rx.Observable.interval(1000).take(10);
        const timer2 = Rx.Observable.interval(2000).take(6);
        const timer3 = Rx.Observable.interval(500).take(10);
        const concurrent = 2; // the argument
        const merged = timer1.merge(timer2, timer3, concurrent);
        merged.subscribe(x => console.log(x));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/midosuqaga/1/embed?js,output'
      }
    }
  ],
  relatedOperators: ['mergeAll', 'mergeMap', 'mergeMapTo', 'mergeScan']
};
