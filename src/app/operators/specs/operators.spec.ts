import { ALL_OPERATORS } from '../../../operator-docs';
import { groupOperatorsByType } from '../operators.component';

describe('Operators', () => {
  it('should group operators by operator type', () => {
    const result = groupOperatorsByType(ALL_OPERATORS);
    expect(Object.keys(result).length).toBe(8);
  });
});
