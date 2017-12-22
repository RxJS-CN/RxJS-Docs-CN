import { OperatorDoc } from '../operator.model';

export const buffer: OperatorDoc = {
  name: 'buffer',
  operatorType: 'transformation',
  signature: 'public buffer(closingNotifier: Observable): Observable',
  useInteractiveMarbles: true,
  parameters: [
    {
      name: 'closingNotifier',
      type: 'Observable',
      attribute: '',
      description:
        'An Observable that signals the buffer to be emitted on the output Observable.'
    }
  ],
  marbleUrl: 'http://reactivex.io/rxjs/img/buffer.png',
  shortDescription: {
    description: `
      Buffers the source Observable values until <span class="markdown-code">closingNotifier</span>
      emits.
    `
  },
  walkthrough: {
    description: `
      <p>
        Buffers the incoming Observable values until the given
        <span class="markdown-code">closingNotifier</span> Observable emits a value, at which point
        it emits the buffer on the output Observable and starts a new buffer internally,
        awaiting the next time <span class="markdown-code">closingNotifier</span> emits.
      </p>
    `
  },
  examples: [
    {
      name: 'On every click, emit array of most recent interval events',
      code: `
        const clicks = Rx.Observable.fromEvent(document, 'click');
        const interval = Rx.Observable.interval(1000);
        const buffered = interval.buffer(clicks);
        buffered.subscribe(x => console.log(x));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/xetemuteho/embed?js,console,output'
      }
    }
  ],
  relatedOperators: [
    'bufferCount',
    'bufferTime',
    'bufferToggle',
    'bufferWhen',
    'window'
  ],
  additionalResources: []
};
