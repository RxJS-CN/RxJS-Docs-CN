import { buffer } from './buffer';
import { bufferCount } from './bufferCount';
import { bufferTime } from './bufferTime';
import { bufferToggle } from './bufferToggle';
import { bufferWhen } from './bufferWhen';
import { concatMap } from './concatMap';
import { expand } from './expand';
import { groupBy } from './groupBy';
import { map } from './map';
import { mapTo } from './mapTo';
import { mergeMap } from './mergeMap';
import { partition } from './partition';
import { pluck } from './pluck';
import { scan } from './scan';
import { switchMap } from './switchMap';
import { windowOperator } from './window';
import { windowCount } from './windowCount';
import { windowToggle } from './windowToggle';
import { windowWhen } from './windowWhen';

export const TRANSFORMATION_OPERATORS = [
  buffer,
  bufferCount,
  bufferTime,
  bufferToggle,
  bufferWhen,
  concatMap,
  expand,
  groupBy,
  map,
  mapTo,
  mergeMap,
  partition,
  pluck,
  scan,
  switchMap,
  windowOperator,
  windowCount,
  windowToggle,
  windowWhen
];
