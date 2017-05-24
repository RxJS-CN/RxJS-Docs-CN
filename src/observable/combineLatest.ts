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
 * 结合多个Observable，创建一个值由每个输入Observable的最新值计算而来的Observable。
 *
 * <span class="informal">每当任一输入Observable发射值，返回Observable使用所有输入
 * Observable的最新值，然后将该值发射。</span>
 *
 * <img src="./img/combineLatest.png" width="100%">
 *
 * `combineLatest` 结合所有输入Observable参数的值. 顺序订阅每个Observable，
 * 每当任一输入Observable发射，收集每个输入Observable的最新值组成一个数组。所以，当你给操作符
 * 传入n个Observable，返回的Observable总是会发射一个长度为n的数组，对应输入Observable
 * 的顺序（第一个Observable的值放到数组的第一个）
 *
 * 静态版本的`combineLatest`接受一个Observables数组或者单个Observable当做参数。
 * 请注意，Observables数组是一个好的选择，如果你事先不知道你将要结合多少个Observable。
 * 传递空的数组将会导致返回Observable立马被完成。
 *
 * 为了保证输出数组的长度相同，`combineLatest`实际上会等待所有的输入Observable至少发射一次，
 * 在返回Observable发射之前。这意味着如果某个输入Observable在其余的输入Observable之前发射，它所发射
 * 的值只保留最新的。另一方面，如果某个输入Observable没有发射值就完成了，返回Observable也不会发
 * 射值并立马完成，因为不可能从已经完成的Observable中收集到值。同样的，如果某个输入Observable
 * 不发射值也不完成，`combineLatest`会永远不发射值也不结束。所以，再次强调下，它会等待所有的流
 * 去发射值。
 *
 * 如果给`combineLatest`至少传递一个输入Observable并且所有传入的输入Observable都发射了值，返回
 * Observable将会在所有结合流完成后完成。所以即使某些Observable完成了，`combineLatest`返回
 * Observable仍然会发射值当其他输入Observable也发射值的时候。对于完成的输入Observable，它
 * 的值一直是最后发射的值。另一方面，如果任一输入Observable发生错误，`combineLatest`也会
 * 立马触发错误状态，所有的其他输入Observable都会被解除订阅。
 *
 * `combineLatest`接受一个可选的参数投射函数，它接受返回Observable发射的值。投射函数
 * 可以返回任何数据，这些数据代替默认的数组被返回Observable发射。需要注意的是，投射函数并不接
 * 受值的数组，还是值本身。这意味着默认的投射函数就是一个接受所有参数并把它们放到一个数组里面的
 * 函数。
 *
 * @example <caption>结合两个 timer Observables</caption>
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
 * @example <caption>结合Observables数组</caption>
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
 * @example <caption>使用project函数动态计算体质指数</caption>
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
 * @param {ObservableInput} observable1 输入Observable用来和其他Observables进行结合.
 * @param {ObservableInput} observable2 输入Observable用来和其他Observables进行结合.
 * 可以有多个输入Observables传入或者第一个参数是Observables数组
 * @param {function} [project] 可选的函数将结合的所有最新的值映射成一个新的值.
 * @param {Scheduler} [scheduler=null] 订阅每个输入的Observable
 * @return {Observable} 一个投射所有输入Observable最新的值，或者所有输入Observable最新值的数组。
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