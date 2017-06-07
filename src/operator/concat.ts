import { Observable, ObservableInput } from '../Observable';
import { IScheduler } from '../Scheduler';
import { isScheduler } from '../util/isScheduler';
import { ArrayObservable } from '../observable/ArrayObservable';
import { MergeAllOperator } from './mergeAll';

/* tslint:disable:max-line-length */
export function concat<T>(this: Observable<T>, scheduler?: IScheduler): Observable<T>;
export function concat<T, T2>(this: Observable<T>, v2: ObservableInput<T2>, scheduler?: IScheduler): Observable<T | T2>;
export function concat<T, T2, T3>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: IScheduler): Observable<T | T2 | T3>;
export function concat<T, T2, T3, T4>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: IScheduler): Observable<T | T2 | T3 | T4>;
export function concat<T, T2, T3, T4, T5>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: IScheduler): Observable<T | T2 | T3 | T4 | T5>;
export function concat<T, T2, T3, T4, T5, T6>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: IScheduler): Observable<T | T2 | T3 | T4 | T5 | T6>;
export function concat<T>(this: Observable<T>, ...observables: Array<ObservableInput<T> | IScheduler>): Observable<T>;
export function concat<T, R>(this: Observable<T>, ...observables: Array<ObservableInput<any> | IScheduler>): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 创建一个输出 Observable，它在当前 Observable 之后顺序地发出每个给定的输入 Observable 中的所有值。
 *
 * <span class="informal">通过顺序地发出多个 Observables 的值将它们连接起来，一个接一个的。</span>
 *
 * <img src="./img/concat.png" width="100%">
 *
 * 通过依次订阅输入Observable将输出Observable加入多个输入Observable，从源头开始，
 * 合并它们的值给输出Observable. 只有前一个Observable结束才会进行下一个Observable。
 *
 * @example <caption>将从0数到3的定时器和从1到10的同步序列进行连接</caption>
 * var timer = Rx.Observable.interval(1000).take(4);
 * var sequence = Rx.Observable.range(1, 10);
 * var result = timer.concat(sequence);
 * result.subscribe(x => console.log(x));
 *
 * // results in:
 * // 1000ms-> 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3 -immediate-> 1 ... 10
 *
 * @example <caption>连接3个Observables</caption>
 * var timer1 = Rx.Observable.interval(1000).take(10);
 * var timer2 = Rx.Observable.interval(2000).take(6);
 * var timer3 = Rx.Observable.interval(500).take(10);
 * var result = timer1.concat(timer2, timer3);
 * result.subscribe(x => console.log(x));
 *
 * // results in the following:
 * // (Prints to console sequentially)
 * // -1000ms-> 0 -1000ms-> 1 -1000ms-> ... 9
 * // -2000ms-> 0 -2000ms-> 1 -2000ms-> ... 5
 * // -500ms-> 0 -500ms-> 1 -500ms-> ... 9
 *
 * @see {@link concatAll}
 * @see {@link concatMap}
 * @see {@link concatMapTo}
 *
 * @param {ObservableInput} other 等待被连接的 Observable。 可以接受多个输入 Observable。
 * @param {Scheduler} [scheduler=null] 可选的调度器，控制每个输入 Observable 的订阅。
 * @return {Observable} 顺序的、串行的将所有输入 Observable 的值合并给输出 Observable。
 * @method concat
 * @owner Observable
 */
export function concat<T, R>(this: Observable<T>, ...observables: Array<ObservableInput<any> | IScheduler>): Observable<R> {
  return this.lift.call(concatStatic<T, R>(this, ...observables));
}

/* tslint:disable:max-line-length */
export function concatStatic<T>(v1: ObservableInput<T>, scheduler?: IScheduler): Observable<T>;
export function concatStatic<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, scheduler?: IScheduler): Observable<T | T2>;
export function concatStatic<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: IScheduler): Observable<T | T2 | T3>;
export function concatStatic<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: IScheduler): Observable<T | T2 | T3 | T4>;
export function concatStatic<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: IScheduler): Observable<T | T2 | T3 | T4 | T5>;
export function concatStatic<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: IScheduler): Observable<T | T2 | T3 | T4 | T5 | T6>;
export function concatStatic<T>(...observables: (ObservableInput<T> | IScheduler)[]): Observable<T>;
export function concatStatic<T, R>(...observables: (ObservableInput<any> | IScheduler)[]): Observable<R>;
/* tslint:enable:max-line-length */
/**
 * 创建一个输出 Observable，该 Observable 顺序的发出每个输入 Observable 的所有值。
 * 
 * <span class="informal">连接多个输入 Observable，顺序的发出它们的值，一个
 * Observable 接一个 Observable。</span>
 *
 * <img src="./img/concat.png" width="100%">
 *
 * `concat`通过一次订阅一个将多个 Observables 连接起来，并将值合并到输出 Observable 中。 
 * 你可以传递一个输入 Observable 数组，或者直接把它们当做参数传递。 传递一个空数组会
 * 导致输出 Observable 立马触发完成状态。
 *
 * `concat`会订阅第一个输入 Observable 并且发出它的所有值, 不去做任何干预。 当这个
 * 输入 Observable 完成时， 订阅第二个输入 Observable，同样的发出它的所有值。这个过
 * 程会不断重复直到输入 Observable 都用过了。当最后一个输入 Observable 完成时，`concat`
 * 也会完成。 任何时刻都只会有一个输入 Observable 发出值。 如果你想让所有的输入 Observable
 * 并行发出数据，请查看{@link merge}, 特别的带上`concurrent`参数。 事实上,`concat`和
 * `concurrent`设置为1的`merge`效果是一样的。
 *
 * 注意，如果输入 Observable 一直都不完成, `concat` 也会一直不能完成并且下一个输入 Observable
 * 将永远不能被订阅. 另一方面, 如果某个输入 Observable 在它被订阅后立马处于完成状态, 那么它对
 * `concat`是不可见的, 仅仅会转向下一个输入 Observable.
 *
 * 如果输入 Observable 链中的任一成员发生错误, `concat`会立马触发错误状态，而不去控制下一个输入
 * Observable. 发生错误的输入 Observable 之后的输入 Observable 不会被订阅.
 *
 * 如果你将同一输入 Observable 传递给`concat`多次，结果流会在每次订阅的时候“重复播放”, 这意味着
 * 你可以重复 Observable 多次. 如果你乏味的给`concat`传递同一输入 Observable 1000次,你可以试着
 * 用用{@link repeat}.
 *
 * @example <caption>将从0数到3的定时器和从1到10的同步序列进行连接</caption>
 * var timer = Rx.Observable.interval(1000).take(4);
 * var sequence = Rx.Observable.range(1, 10);
 * var result = Rx.Observable.concat(timer, sequence);
 * result.subscribe(x => console.log(x));
 *
 * // results in:
 * // 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3 -immediate-> 1 ... 10
 *
 *
 * @example <caption>连接3个 Observables</caption>
 * var timer1 = Rx.Observable.interval(1000).take(10);
 * var timer2 = Rx.Observable.interval(2000).take(6);
 * var timer3 = Rx.Observable.interval(500).take(10);
 * var result = Rx.Observable.concat([timer1, timer2, timer3]); // note that array is passed
 * result.subscribe(x => console.log(x));
 *
 * // results in the following:
 * // (Prints to console sequentially)
 * // -1000ms-> 0 -1000ms-> 1 -1000ms-> ... 9
 * // -2000ms-> 0 -2000ms-> 1 -2000ms-> ... 5
 * // -500ms-> 0 -500ms-> 1 -500ms-> ... 9
 *
 *
 * @example <caption>连接同一个 Observable 多次</caption>
 * const timer = Rx.Observable.interval(1000).take(2);
 *
 * Rx.Observable.concat(timer, timer) // concating the same Observable!
 * .subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('...and it is done!')
 * );
 *
 * // Logs:
 * // 0 after 1s
 * // 1 after 2s
 * // 0 after 3s
 * // 1 after 4s
 * // "...and it is done!" also after 4s
 *
 * @see {@link concatAll}
 * @see {@link concatMap}
 * @see {@link concatMapTo}
 *
 * @param {ObservableInput} input1 等待被连接的输入 Observable。
 * @param {ObservableInput} input2 等待被连接的输入 Observable。
 * 可以传递多个输入Observable.
 * @param {Scheduler} [scheduler=null] 可选的调度器，调度每个 Observable 的订阅。
 * @return {Observable} 有序的、串行的将所有输入 Observable 的值合并到单一的输出 Observable。
 * @static true
 * @name concat
 * @owner Observable
 */
export function concatStatic<T, R>(...observables: Array<ObservableInput<any> | IScheduler>): Observable<R> {
  let scheduler: IScheduler = null;
  let args = <any[]>observables;
  if (isScheduler(args[observables.length - 1])) {
    scheduler = args.pop();
  }

  if (scheduler === null && observables.length === 1 && observables[0] instanceof Observable) {
    return <Observable<R>>observables[0];
  }

  return new ArrayObservable(observables, scheduler).lift(new MergeAllOperator<R>(1));
}
