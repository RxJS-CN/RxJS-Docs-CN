import { catchOperator } from './catch';
import { retry } from './retry';
import { retryWhen } from './retryWhen';

export const ERROR_HANDLING_OPERATORS = [
  catchOperator,
  retry,
  retryWhen
];
