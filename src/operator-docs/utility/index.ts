import { delay } from './delay';
import { delayWhen } from './delayWhen';
import { dematerialize } from './dematerialize';
import { doOperator } from './do';
import { letOperator } from './let';
import { toPromise } from './toPromise';

export const UTILITY_OPERATORS = [
  delay,
  delayWhen,
  dematerialize,
  doOperator,
  letOperator,
  toPromise
];
