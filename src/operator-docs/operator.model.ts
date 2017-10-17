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

export interface OperatorParameters {
  name: string;
  type: string;
  attribute: string;
  description: string;
}

export interface OperatorExample {
  name: string;
  code: string;
  externalLink: ExternalLink;
}

export interface OperatorExtra {
  type: 'Tip' | 'Warning';
  text: string;
}

export interface OperatorDoc {
  readonly name?: string;
  readonly operatorType?: OperatorType;
  readonly signature?: string;
  readonly useInteractiveMarbles?: boolean;
  readonly marbleUrl?: string;
  readonly parameters?: OperatorParameters[];
  readonly shortDescription?: {
    description: string;
    extras?: OperatorExtra[]
  };
  readonly walkthrough?: {
    description: string;
    extras?: OperatorExtra[]
  };
  readonly examples?: OperatorExample[];
  readonly additionalResources?: OperatorReference[];
  readonly relatedOperators?: string[];
}
