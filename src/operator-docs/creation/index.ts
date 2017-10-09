import { create } from './create';
import { empty } from './empty';
import { from } from './from';
import { fromEvent } from './fromEvent';
import { fromPromise } from './fromPromise';
import { interval } from './interval';
import { ofOperator } from './of';
import { range } from './range';
import { throwOperator } from './throw';
import { timer } from './timer';

export const CREATION_OPERATORS = [
  create,
  empty,
  from,
  fromEvent,
  fromPromise,
  interval,
  ofOperator,
  range,
  throwOperator,
  timer
];
