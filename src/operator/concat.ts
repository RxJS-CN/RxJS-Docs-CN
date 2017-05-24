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
 * 创建一个顺序发出所有输入Observable发出的值的输出Observable
 *
 * <span class="informal">连接多个输入Observable通过顺序的发出它们发出的值,一个Observable
 * 接一个Observable.</span>
 *
 * <img src="./img/concat.png" width="100%">
 *
 * 通过依次订阅输入Observable将输出Observable加入多个输入Observable，从源头开始，
 * 合并它们的值给输出Observable. 只有前一个Observable结束才会进行下一个Observable。
 *
 * @example <caption>连接一个从0到3的时间纪数器和同步的0到10序列</caption>
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
 * @param {ObservableInput} other 等待被连接的Observable. 可以接受多个输入Observable.
 * @param {Scheduler} [scheduler=null] 可选的调度器，控制每个输入Observable的订阅.
 * @return {Observable} 顺序的、串行的将所有输入Observable的值合并给输出Observable.
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
 * 创建一个输出Observable，该Observable顺序的发出每个输入Observable的所有值。
 * 
 * <span class="informal">连接多个输入Observable，顺序的发生它们的值，一个
 * Observable接一个Observable.</span>
 *
 * <img src="./img/concat.png" width="100%">
 *
 * `concat`将多个Observable连接在一起，通过顺序的订阅将值合并到输出Observable. 
 * 你可以传递一个输入Observable数组，或者直接把它们当做参数传递. 传递一个空数组会
 * 导致输出Observable立马触发完成状态.
 *
 * `concat`会订阅第一个输入Observable并且发出它的所有值, 不去做任何干预. 当这个
 * 输入Observable完成时， 订阅第二个输入Observable，同样的发出它的所有值.这个过
 * 程会不断重复直到输入Observable不够了.当最后一个输入Observable完成时，`concat`
 * 也会完成. 任何时刻都只会有一个输入Observable发出值. 如果你想让所有的输入Observable
 * 并行发出数据，请查看{@link merge}, 特别的带上`concurrent`参数. 事实上,`concat`和
 * `concurrent`设置为1的`merge`效果是一样的.
 *
 * 注意，如果输入Observable一直都不完成, `concat` 也会一直不能完成并且下一个输入Observable
 * 将永远不能被订阅. 另一方面, 如果某个输入Observable在它被订阅后立马处于完成状态, 那么它对
 * `concat`是不可见的, 仅仅会转向下一个输入Observable.
 *
 * 如果输入Observable链中的任一成员发生错误, `concat`会立马触发错误状态，而不去控制下一个输入
 * Observable. 发生错误的输入Observable之后的输入Observable不会被订阅.
 *
 * 如果你将同一输入Observable传递给`concat`多次，结果流会在每次订阅的时候“重复播放”, 这意味着
 * 你可以重复Observable多次. 如果你乏味的给`concat`传递同一输入Observable1000次,你可以试着
 * 用用{@link repeat}.
 *
 * @example <caption>连接一个从0到3的时间记数器和同步的0到10序列</caption>
 * var timer = Rx.Observable.interval(1000).take(4);
 * var sequence = Rx.Observable.range(1, 10);
 * var result = Rx.Observable.concat(timer, sequence);
 * result.subscribe(x => console.log(x));
 *
 * // results in:
 * // 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3 -immediate-> 1 ... 10
 *
 *
 * @example <caption>连接3个Observables</caption>
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
 * @example <caption>连接同一个Observable多次</caption>
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
 * @param {ObservableInput} input1 等待被连接的输入Observable.
 * @param {ObservableInput} input2 等待被连接的输入Observable.
 * 可以传递多个输入Observable.
 * @param {Scheduler} [scheduler=null] 可选的调度器，调度每个Observable的订阅.
 * @return {Observable} 有序的、串行的将所有输入Observable的值合并到单一的输出Observable.
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
