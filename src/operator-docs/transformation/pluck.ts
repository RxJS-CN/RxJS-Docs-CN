import { OperatorDoc } from '../operator.model';

export const pluck: OperatorDoc = {
  name: 'pluck',
  operatorType: 'transformation',
  signature: 'public pluck(properties: ...string): Observable',
  marbleUrl: 'http://reactivex.io/rxjs/img/pluck.png',
  parameters: [
    {
      name: 'properties',
      type: '...string',
      attribute: '',
      description: `
        The nested properties to 'pluck' from each source value (an object).
      `
    }
  ],
  shortDescription: {
    description:
      'Maps each source value (an object) to its specified nested property.',
    extras: [
      {
        type: 'Tip',
        text: `
          Like <a href="#/operators/map" class="markdown-code">map</a>, but meant
          only for picking one of the nested properties of every emitted object.
        `
      }
    ]
  },
  walkthrough: {
    description: `
      <p>
        Given a list of strings describing a path to an object property, retrieves
        the value of a specified nested property from all values in the source Observable.
        If a property can't be resolved, it will return <span class="markdown-code">undefined</span>
        for that value.
      </p>
    `
  },
  examples: [
    {
      name:
        'Map every every click to the tagName of the clicked target element',
      code: `
        const clicks = Rx.Observable.fromEvent(document, 'click');
        const tagNames = clicks.pluck('target', 'tagName');
        tagNames.subscribe(x => console.log(x));
      `,
      externalLink: {
        platform: 'JSBin',
        url: 'http://jsbin.com/vucuca/embed?js,console,output'
      }
    }
  ],
  relatedOperators: ['map'],
  additionalResources: []
};
