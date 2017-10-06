import { OperatorDoc } from '../operator.model';

export const combineAll: OperatorDoc = {
  "name": "combineAll",
  "operatorType": "combination",
  "signature": "public combineAll(project: function): Observable",
  "shortDescription": "Flattens an Observable-of-Observables by applying combineLatest when the Observable-of-Observables completes."
};
