export type OperatorType = 'combination'
  | 'conditional'
  | 'creation'
  | 'error handling'
  | 'filtering'
  | 'multicasting'
  | 'transformation'
  | 'utility';

export interface OperatorReference {
  url: string;
  description: string;
  author?: string;
}

export interface ExternalLink {
  platform: 'JSBin' | 'JSFiddle';
  url: string;
}

export interface OperatorExample {
  name: string;
  code: string;
  externalLinks: ExternalLink[];
}

export interface OperatorDoc {
  readonly name?: string;
  readonly operatorType?: OperatorType;
  readonly signature?: string;
  readonly shortDescription?: string;
  readonly longDescription?: string;
  readonly examples?: OperatorExample[];
  readonly additionalReferences?: OperatorReference[];
  readonly relatedOperators?: string[];
}
