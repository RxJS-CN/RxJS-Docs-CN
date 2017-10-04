export type OperatorType = 'combination'
  | 'conditional'
  | 'creation'
  | 'error handling'
  | 'filtering'
  | 'multicasting'
  | 'transformation'
  | 'utility';

export interface OperatorDoc {
  readonly name?: string;
  readonly operatorType?: OperatorType;
}
