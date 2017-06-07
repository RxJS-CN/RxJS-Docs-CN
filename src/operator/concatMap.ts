import { MergeMapOperator } from './mergeMap';
import { Observable, ObservableInput } from '../Observable';

/* tslint:disable:max-line-length */
export function concatMap<T, R>(this: Observable<T>, project: (value: T, index: number) =>  ObservableInput<R>): Observable<R>;
export function concatMap<T, I, R>(this: Observable<T>, project: (value: T, index: number) =>  ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 将源值投射为一个合并到输出 Observable 的 Observable,以串行的方式等待前一个完成再合并下一个
 * Observable。
 * 
 * <span class="informal">将每个值映射为 Observable, 然后使用{@link concatAll}将所有的
 * 内部 Observables 打平。</span>
 *
 * <img src="./img/concatMap.png" width="100%">
 *
 * 返回一个 Observable，该 Observable 发出基于对源 Observable 发出的值调用提供的函数, 
 * 该函数返回所谓的内部 Observable。 每个新的内部 Observable 和前一个内部 Observable 连接在一起。
 *
 * 警告: 如果源值不断的到达并且速度快于内部 Observables 完成的速度, 它会导致内存问题，
 * 因为内部的 Observable 在无限制的缓冲区中聚集，以等待轮流订阅。
 *
 * Note: ｀concatMap｀ 等价于 ｀concurrency｀ 参数(最大并发数)为1的 ｀mergeMap｀ 。
 *
 * @example <caption>每次点击都会触发从0到3的定时器(时间间隔为1秒)，定时器之间是串行的</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.concatMap(ev => Rx.Observable.interval(1000).take(4));
 * result.subscribe(x => console.log(x));
 *
 * // 结果如下:
 * // (结果是串行的)
 * // 对于"document"对象上的点击事件，都会以1秒的间隔发出从0到3的值
 * // one click = 1000ms-> 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3
 *
 * @see {@link concat}
 * @see {@link concatAll}
 * @see {@link concatMapTo}
 * @see {@link exhaustMap}
 * @see {@link mergeMap}
 * @see {@link switchMap}
 *
 * @param {function(value: T, ?index: number): ObservableInput} project 
 * 用在源Observable发出的每个值上,返回Observable.
 * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]
 * 函数，它用于产生基于值的输出 Observable 和源(外部)发送和内部 Observable 发送的索引。
 * 传递给这个函数参数有：
 * - `outerValue`: 来自源的值
 * - `innerValue`: 来自投射的 Observable 的值
 * - `outerIndex`: 来自源的值的 "index"
 * - `innerIndex`: 来自投射的 Observable 的值的 "index"
 * @return {Observable} Observable，发出对源Observable发出的每个值使用投射函数
 * (和可选的`resultSelector`)的结果并且顺序的取出每个投射过的内部Observable的值.
 * @method concatMap
 * @owner Observable
 */
export function concatMap<T, I, R>(this: Observable<T>, project: (value: T, index: number) =>  ObservableInput<I>,
                                   resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R) {
  return this.lift(new MergeMapOperator(project, resultSelector, 1));
}
