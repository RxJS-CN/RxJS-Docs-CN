import { combineAll } from './combineAll';
import { combineLatest } from './combineLatest';
import { concat } from './concat';
import { concatAll } from './concatAll';
import { forkJoin } from './forkJoin';
import { merge } from './merge';
import { mergeAll } from './mergeAll';
import { pairwise } from './pairwise';
import { race } from './race';
import { startWith } from './startWith';
import { withLatestFrom } from './withLatestFrom';
import { zip } from './zip';

export const COMBINATION_OPERATORS = [
  combineAll,
  combineLatest,
  concat,
  concatAll,
  forkJoin,
  merge,
  mergeAll,
  pairwise,
  race,
  startWith,
  withLatestFrom,
  zip
];
