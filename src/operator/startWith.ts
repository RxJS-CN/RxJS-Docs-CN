import { IScheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { ArrayObservable } from '../observable/ArrayObservable';
import { ScalarObservable } from '../observable/ScalarObservable';
import { EmptyObservable } from '../observable/EmptyObservable';
import { concatStatic } from './concat';
import { isScheduler } from '../util/isScheduler';

/* tslint:disable:max-line-length */
export function startWith<T>(this: Observable<T>, v1: T, scheduler?: IScheduler): Observable<T>;
export function startWith<T>(this: Observable<T>, v1: T, v2: T, scheduler?: IScheduler): Observable<T>;
export function startWith<T>(this: Observable<T>, v1: T, v2: T, v3: T, scheduler?: IScheduler): Observable<T>;
export function startWith<T>(this: Observable<T>, v1: T, v2: T, v3: T, v4: T, scheduler?: IScheduler): Observable<T>;
export function startWith<T>(this: Observable<T>, v1: T, v2: T, v3: T, v4: T, v5: T, scheduler?: IScheduler): Observable<T>;
export function startWith<T>(this: Observable<T>, v1: T, v2: T, v3: T, v4: T, v5: T, v6: T, scheduler?: IScheduler): Observable<T>;
export function startWith<T>(this: Observable<T>, ...array: Array<T | IScheduler>): Observable<T>;
/* tslint:enable:max-line-length */

/**
 * 返回的 Observable 会先发出作为参数指定的项，然后再发出由源 Observable 所发出的项。
 *
 * <img src="./img/startWith.png" width="100%">
 *
 * @param {...T} values - 你希望修改过的 Observable 可以先发出的项。
 * @param {Scheduler} [scheduler] - 用于调度 `next` 通知发送的 {@link IScheduler} 。
 * @return {Observable} 该 Observable 发出指定的 Iterable 中的项，然后发出由源 Observable 所发出的项。
 * @method startWith
 * @owner Observable
 */
export function startWith<T>(this: Observable<T>, ...array: Array<T | IScheduler>): Observable<T> {
  let scheduler = <IScheduler>array[array.length - 1];
  if (isScheduler(scheduler)) {
    array.pop();
  } else {
    scheduler = null;
  }

  const len = array.length;
  if (len === 1) {
    return concatStatic(new ScalarObservable<T>(<T>array[0], scheduler), <Observable<T>>this);
  } else if (len > 1) {
    return concatStatic(new ArrayObservable<T>(<T[]>array, scheduler), <Observable<T>>this);
  } else {
    return concatStatic(new EmptyObservable<T>(scheduler), <Observable<T>>this);
  }
}
