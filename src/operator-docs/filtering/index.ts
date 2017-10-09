import { debounce } from './debounce';
import { debounceTime } from './debounceTime';
import { distinctUntilChanged } from './distinctUntilChanged';
import { filter } from './filter';
import { first } from './first';
import { ignoreElements } from './ignoreElements';
import { last } from './last';
import { sample } from './sample';
import { single } from './single';
import { skip } from './skip';
import { skipUntil } from './skipUntil';
import { skipWhile } from './skipWhile';
import { take } from './take';
import { takeUntil } from './takeUntil';
import { takeWhile } from './takeWhile';
import { throttle } from './throttle';
import { throttleTime } from './throttleTime';

export const FILTERING_OPERATORS = [
  debounce,
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  ignoreElements,
  last,
  sample,
  single,
  skip,
  skipUntil,
  skipWhile,
  take,
  takeUntil,
  takeWhile,
  throttle,
  throttleTime
];
