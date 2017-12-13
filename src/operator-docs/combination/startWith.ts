import { OperatorDoc } from '../operator.model';

export const startWith: OperatorDoc = {
  name: 'startWith',
  operatorType: 'combination',
  marbleUrl: 'http://reactivex.io/rxjs/img/startWith.png',
  signature: 'public startWith(values: ...T, scheduler: Scheduler): Observable',
  shortDescription: {
    description:
      'Returns an Observable that emits the items you specify as arguments before it begins to emit items emitted by the source Observable.'
  },
  parameters: [
    {
      name: 'values',
      type: '...T',
      attribute: '',
      description: 'Items you want the modified Observable to emit first.'
    },
    {
      name: 'scheduler',
      type: 'Scheduler',
      attribute: 'optional',
      description:
        'A IScheduler to use for scheduling the emissions of the next notifications.'
    }
  ]
};
