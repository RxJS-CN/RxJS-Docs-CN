import { OperatorDoc } from '../operator.model';

export const pairwise: OperatorDoc = {
  name: 'pairwise',
  operatorType: 'combination',
  marbleUrl: 'http://reactivex.io/rxjs/img/pairwise.png',
  signature: 'public pairwise(): Observable<Array<T>>',
  shortDescription: {
    description:
      'Groups pairs of consecutive emissions together and emits them as an array of two values.',
    extras: [
      {
        type: 'Tip',
        text:
          'Puts the current value and previous value together as an array, and emits that.'
      }
    ]
  },
  walkthrough: {
    description: `
      <p>The Nth emission from the source Observable will cause the output Observable
      to emit an array [(N-1)th, Nth] of the previous and the current value, as a
      pair. For this reason, <code>pairwise</code> emits on the second and subsequent
      emissions from the source Observable, but not on the first emission, because
      there is no previous value in that case.</p>
    `
  },
  examples: [
    {
      name:
        'On every click (starting from the second), emit the relative distance to the previous click',
      code: `
      const clicks = Rx.Observable.fromEvent(document, 'click');
      const pairs = clicks.pairwise();
      const distance = pairs.map(pair => {
        const x0 = pair[0].clientX;
        const y0 = pair[0].clientY;
        const x1 = pair[1].clientX;
        const y1 = pair[1].clientY;
        return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
      });
      distance.subscribe(x => console.log(x));
    `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/wenazagegu/embed?js,console,output'
      }
    }
  ],
  relatedOperators: ['buffer', 'bufferCount']
};
