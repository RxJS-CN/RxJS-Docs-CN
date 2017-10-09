import { OperatorDoc } from './operator.model';

import { COMBINATION_OPERATORS } from './combination';
import { CONDITIONAL_OPERATORS } from './conditional';
import { CREATION_OPERATORS } from './creation';
import { ERROR_HANDLING_OPERATORS } from './error-handling';
import { FILTERING_OPERATORS } from './filtering';
import { MULTICASTING_OPERATORS } from './multicasting';
import { TRANSFORMATION_OPERATORS } from './transformation';
import { UTILITY_OPERATORS } from './utility';

export const ALL_OPERATORS: OperatorDoc[] = [
  ...COMBINATION_OPERATORS,
  ...CONDITIONAL_OPERATORS,
  ...CREATION_OPERATORS,
  ...ERROR_HANDLING_OPERATORS,
  ...FILTERING_OPERATORS,
  ...MULTICASTING_OPERATORS,
  ...TRANSFORMATION_OPERATORS,
  ...UTILITY_OPERATORS
];

export * from './operator.model';
