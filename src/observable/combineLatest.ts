import {  Observable, ObservableInput  } from '../Observable';
import {  IScheduler  } from '../Scheduler';
import {  isScheduler  } from '../util/isScheduler';
import {  isArray  } from '../util/isArray';
import {  ArrayObservable  } from './ArrayObservable';
import {  CombineLatestOperator  } from '../operator/combineLatest';

/* tslint:disable:max-line-length */
export function combineLatest<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, scheduler?: IScheduler): Observable<[T, T2]>;
export function combineLatest<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: IScheduler): Observable<[T, T2, T3]>;
export function combineLatest<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: IScheduler): Observable<[T, T2, T3, T4]>;
export function combineLatest<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: IScheduler): Observable<[T, T2, T3, T4, T5]>;
export function combineLatest<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: IScheduler): Observable<[T, T2, T3, T4, T5, T6]>;

export function combineLatest<T, R>(v1: ObservableInput<T>, project: (v1: T) => R, scheduler?: IScheduler): Observable<R>;
export function combineLatest<T, T2, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, project: (v1: T, v2: T2) => R, scheduler?: IScheduler): Observable<R>;
export function combineLatest<T, T2, T3, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, project: (v1: T, v2: T2, v3: T3) => R, scheduler?: IScheduler): Observable<R>;
export function combineLatest<T, T2, T3, T4, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => R, scheduler?: IScheduler): Observable<R>;
export function combineLatest<T, T2, T3, T4, T5, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R, scheduler?: IScheduler): Observable<R>;
export function combineLatest<T, T2, T3, T4, T5, T6, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R, scheduler?: IScheduler): Observable<R>;

export function combineLatest<T>(array: ObservableInput<T>[], scheduler?: IScheduler): Observable<T[]>;
export function combineLatest<R>(array: ObservableInput<any>[], scheduler?: IScheduler): Observable<R>;
export function combineLatest<T, R>(array: ObservableInput<T>[], project: (...values: Array<T>) => R, scheduler?: IScheduler): Observable<R>;
export function combineLatest<R>(array: ObservableInput<any>[], project: (...values: Array<any>) => R, scheduler?: IScheduler): Observable<R>;
export function combineLatest<T>(...observables: Array<ObservableInput<T> | IScheduler>): Observable<T[]>;
export function combineLatest<T, R>(...observables: Array<ObservableInput<T> | ((...values: Array<T>) => R) | IScheduler>): Observable<R>;
export function combineLatest<R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R) | IScheduler>): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 结合多个Observables创建一个值由每个输入Observable的最新值计算而来的Observable。
 *
 * <span class="informal">每当任一输入Observable发射一个值，它使用所有输入的最新
 * 值，然后将该值发射。</span>
 *
 * <img src="./img/combineLatest.png" width="100%">
 *
 * `combineLatest` 结合所有传入的Observables参数的值. 这是通过顺序订阅每个Observable，
 * 每当任一Observable发射，收集每个Observable的最新的值组成一个数组。所以，当你给操作符
 * 传入'n'个Observables，返回的Observable总是会发射一个长度为‘n’的数组，对应传递Observable
 * 的顺序（第一个Observable的值放到数组的第一个）
 *
 * 静态版本的`combineLatest`接受一个Observables数组或者单个Observable当做参数。
 * 请注意，Observables数组是一个好的选择，如果你事先不知道多少个Observables你将要结合。
 * 传递空的数组将会导致Observable立马被完成。
 *
 * 为了保证输出数组的长度相同，`combineLatest`实际上会等待所有的输入Observables至少发射一次，
 * 在输出Observable发射之前。这意味着如果某些Observable在其余的Observable之前发射，所有的值
 * 除了最后的值都会被丢弃。
 * This means if some Observable emits
 * values before other Observables started emitting, all that values but last
 * will be lost. On the other hand, is some Observable does not emit value but
 * completes, resulting Observable will complete at the same moment without
 * emitting anything, since it will be now impossible to include value from
 * completed Observable in resulting array. Also, if some input Observable does
 * not emit any value and never completes, `combineLatest` will also never emit
 * and never complete, since, again, it will wait for all streams to emit some
 * value.
 *
 * If at least one Observable was passed to `combineLatest` and all passed Observables
 * emitted something, resulting Observable will complete when all combined
 * streams complete. So even if some Observable completes, result of
 * `combineLatest` will still emit values when other Observables do. In case
 * of completed Observable, its value from now on will always be the last
 * emitted value. On the other hand, if any Observable errors, `combineLatest`
 * will error immediately as well, and all other Observables will be unsubscribed.
 *
 * `combineLatest` accepts as optional parameter `project` function, which takes
 * as arguments all values that would normally be emitted by resulting Observable.
 * `project` can return any kind of value, which will be then emitted by Observable
 * instead of default array. Note that `project` does not take as argument that array
 * of values, but values themselves. That means default `project` can be imagined
 * as function that takes all its arguments and puts them into an array.
 *
 *
 * @example <caption>Combine two timer Observables</caption>
 * const firstTimer = Rx.Observable.timer(0, 1000); // emit 0, 1, 2... after every second, starting from now
 * const secondTimer = Rx.Observable.timer(500, 1000); // emit 0, 1, 2... after every second, starting 0,5s from now
 * const combinedTimers = Rx.Observable.combineLatest(firstTimer, secondTimer);
 * combinedTimers.subscribe(value => console.log(value));
 * // Logs
 * // [0, 0] after 0.5s
 * // [1, 0] after 1s
 * // [1, 1] after 1.5s
 * // [2, 1] after 2s
 *
 *
 * @example <caption>Combine an array of Observables</caption>
 * const observables = [1, 5, 10].map(
 *   n => Rx.Observable.of(n).delay(n * 1000).startWith(0) // emit 0 and then emit n after n seconds
 * );
 * const combined = Rx.Observable.combineLatest(observables);
 * combined.subscribe(value => console.log(value));
 * // Logs
 * // [0, 0, 0] immediately
 * // [1, 0, 0] after 1s
 * // [1, 5, 0] after 5s
 * // [1, 5, 10] after 10s
 *
 *
 * @example <caption>Use project function to dynamically calculate the Body-Mass Index</caption>
 * var weight = Rx.Observable.of(70, 72, 76, 79, 75);
 * var height = Rx.Observable.of(1.76, 1.77, 1.78);
 * var bmi = Rx.Observable.combineLatest(weight, height, (w, h) => w / (h * h));
 * bmi.subscribe(x => console.log('BMI is ' + x));
 *
 * // With output to console:
 * // BMI is 24.212293388429753
 * // BMI is 23.93948099205209
 * // BMI is 23.671253629592222
 *
 *
 * @see {@link combineAll}
 * @see {@link merge}
 * @see {@link withLatestFrom}
 *
 * @param {ObservableInput} observable1 An input Observable to combine with other Observables.
 * @param {ObservableInput} observable2 An input Observable to combine with other Observables.
 * More than one input Observables may be given as arguments
 * or an array of Observables may be given as the first argument.
 * @param {function} [project] An optional function to project the values from
 * the combined latest values into a new value on the output Observable.
 * @param {Scheduler} [scheduler=null] The IScheduler to use for subscribing to
 * each input Observable.
 * @return {Observable} An Observable of projected values from the most recent
 * values from each input Observable, or an array of the most recent values from
 * each input Observable.
 * @static true
 * @name combineLatest
 * @owner Observable
 */
export function combineLatest<T, R>(...observables: Array<any | ObservableInput<any> |
                                                    Array<ObservableInput<any>> |
                                                    (((...values: Array<any>) => R)) |
                                                    IScheduler>): Observable<R> {
  let project: (...values: Array<any>) => R =  null;
  let scheduler: IScheduler = null;

  if (isScheduler(observables[observables.length - 1])) {
    scheduler = <IScheduler>observables.pop();
  }

  if (typeof observables[observables.length - 1] === 'function') {
    project = <(...values: Array<any>) => R>observables.pop();
  }

  // if the first and only other argument besides the resultSelector is an array
  // assume it's been called with `combineLatest([obs1, obs2, obs3], project)`
  if (observables.length === 1 && isArray(observables[0])) {
    observables = <Array<Observable<any>>>observables[0];
  }

  return new ArrayObservable(observables, scheduler).lift(new CombineLatestOperator<T, R>(project));
}