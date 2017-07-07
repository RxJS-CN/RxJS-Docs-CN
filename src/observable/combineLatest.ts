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
 * 组合多个 Observables 来创建一个 Observable ，该 Observable 的值根据每个输入 Observable 的最新值计算得出的。
 *
 * <span class="informal">它将使用所有输入中的最新值计算公式，然后发出该公式的输出。</span>
 *
 * <img src="./img/combineLatest.png" width="100%">
 *
 * `combineLatest` 结合所有输入 Observable 参数的值. 顺序订阅每个 Observable，
 * 每当任一输入 Observable 发出，收集每个输入 Observable 的最新值组成一个数组。所以，当你给操作符
 * 传入 n 个 Observable，返回的 Observable 总是会发出一个长度为 n 的数组，对应输入 Observable
 * 的顺序（第一个 Observable 的值放到数组的第一个）。
 *
 * 静态版本的 `combineLatest` 接受一个 Observables 数组或者每个 Observable 可以直接作为参数。
 * 请注意，如果你事先不知道你将要结合多少个 Observable， 那么 Observables 数组是一个好的选择。
 * 传递空的数组将会导致返回 Observable 立马完成。
 *
 * 为了保证输出数组的长度相同，`combineLatest` 实际上会等待所有的输入 Observable 至少发出一次，
 * 在返回 Observable 发出之前。这意味着如果某个输入 Observable 在其余的输入 Observable 之前发出，它所发出
 * 的值只保留最新的。另一方面，如果某个输入 Observable 没有发出值就完成了，返回 Observable 也不会发
 * 射值并立马完成，因为不可能从已经完成的 Observable 中收集到值。同样的，如果某个输入 Observable
 * 不发出值也不完成，`combineLatest`会永远不发出值也不结束。所以，再次强调下，它会等待所有的流
 * 去发出值。
 *
 * 如果给`combineLatest`至少传递一个输入 Observable 并且所有传入的输入 Observable 都发出了值，返回
 * Observable 将会在所有结合流完成后完成。所以即使某些 Observable 完成了，当其他输入 Observable
 * 发出值的时候，combineLatest返回 Observable 仍然会发出值。对于完成的输入 Observable，它
 * 的值一直是最后发出的值。另一方面，如果任一输入 Observable 发生错误，`combineLatest`也会
 * 立马触发错误状态，所有的其他输入 Observable 都会被解除订阅。
 *
 * `combineLatest`接受一个可选的参数投射函数，它接受返回 Observable 发出的值。投射函数
 * 可以返回任何数据，这些数据代替默认的数组被返回 Observable 发出。需要注意的是，投射函数并不接
 * 受值的数组，而是值本身。这意味着默认的投射函数就是一个接受所有参数并把它们放到一个数组里面的
 * 函数。
 *
 * @example <caption>结合两个 timer Observables</caption>
 * const firstTimer = Rx.Observable.timer(0, 1000); // 从现在开始，每隔1秒发出0, 1, 2...
 * const secondTimer = Rx.Observable.timer(500, 1000); // 0.5秒后，每隔1秒发出0, 1, 2...
 * const combinedTimers = Rx.Observable.combineLatest(firstTimer, secondTimer);
 * combinedTimers.subscribe(value => console.log(value));
 * // Logs
 * // [0, 0] after 0.5s
 * // [1, 0] after 1s
 * // [1, 1] after 1.5s
 * // [2, 1] after 2s
 *
 *
 * @example <caption>结合 Observables 数组</caption>
 * const observables = [1, 5, 10].map(
 *   n => Rx.Observable.of(n).delay(n * 1000).startWith(0) // 先发出0，然后在 n 秒后发出 n。
 * );
 * const combined = Rx.Observable.combineLatest(observables);
 * combined.subscribe(value => console.log(value));
 * // 日志
 * // [0, 0, 0] 立刻
 * // [1, 0, 0] 1s 后
 * // [1, 5, 0] 5s 后
 * // [1, 5, 10] 10s 后
 *
 *
 * @example <caption>使用 project 函数动态计算体重指数</caption>
 * var weight = Rx.Observable.of(70, 72, 76, 79, 75);
 * var height = Rx.Observable.of(1.76, 1.77, 1.78);
 * var bmi = Rx.Observable.combineLatest(weight, height, (w, h) => w / (h * h));
 * bmi.subscribe(x => console.log('BMI is ' + x));
 *
 * // 控制台输出:
 * // BMI is 24.212293388429753
 * // BMI is 23.93948099205209
 * // BMI is 23.671253629592222
 *
 *
 * @see {@link combineAll}
 * @see {@link merge}
 * @see {@link withLatestFrom}
 *
 * @param {ObservableInput} observable1 用来和其他 Observables 进行结合的输入 Observable 。
 * @param {ObservableInput} observable2 用来和其他 Observables 进行结合的输入 Observable 。
 * 可以有多个输入Observables传入或者第一个参数是Observables数组
 * @param {function} [project] 投射成输出 Observable 上的一个新的值。
 * @param {Scheduler} [scheduler=null] 用来订阅每个输入 Observable 的调度器。
 * @return {Observable} 该 Observable 为每个输入 Observable 的最新值的投射，或者每个输入 Observable 的最新值的数组。
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