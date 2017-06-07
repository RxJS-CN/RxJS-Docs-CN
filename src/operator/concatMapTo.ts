import { Observable, ObservableInput } from '../Observable';
import { MergeMapToOperator } from './mergeMapTo';

/* tslint:disable:max-line-length */
export function concatMapTo<T, R>(this: Observable<T>, observable: ObservableInput<R>): Observable<R>;
export function concatMapTo<T, I, R>(this: Observable<T>, observable: ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 将每个源值投射成同一个 Observable ，该 Observable 会以串行的方式多次合并到输出 Observable 中 。
 * 
 * <span class="informal">就像是{@link concatMap}, 但是将每个值总是映射为同一个内部 Observable。</span>
 *
 * <img src="./img/concatMapTo.png" width="100%">
 *
 * 不管源值是多少都将其映射为给定的`innerObservable`, 然后将其打平为单个 Observable,也就
 * 是所谓的输出 Observable。 在输出 Observable 上发出的每个新的 innerObservable 实例与
 * 先前的 innerObservable 实例相连接。
 *
 * 警告: 如果源值不断的到达并且速度快于内部Observables完成的速度, 它会导致内存问题
 * 因为内部的 Observable 在无限制的缓冲区中聚集，以等待轮流订阅。
 *
 * Note: `concatMapTo` is equivalent to `mergeMapTo` with concurrency parameter
 * set to `1`.
 *
 * @example <caption>每次点击都会触发从0到3的定时器(时间间隔为1秒)，定时器之间是串行的</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.concatMapTo(Rx.Observable.interval(1000).take(4));
 * result.subscribe(x => console.log(x));
 *
 * // 结果如下:
 * // (结果不是并行的)
 * // 对于"document"对象上的点击事件，都会以1秒的间隔发出从0到3的值
 * // one click = 1000ms-> 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3
 *
 * @see {@link concat}
 * @see {@link concatAll}
 * @see {@link concatMap}
 * @see {@link mergeMapTo}
 * @see {@link switchMapTo}
 *
 * @param {ObservableInput} innerObservable Observable，替换源Observable的每个值.
 * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]
 * 函数，它用于产生基于值的输出 Observable 和源(外部)发送和内部 Observable 发送的索引。
 * 传递给这个函数参数有：
 * - `outerValue`: 来自源的值
 * - `innerValue`: 来自投射的 Observable 的值
 * - `outerIndex`: 来自源的值的 "index"
 * - `innerIndex`: 来自投射的 Observable 的值的 "index"
 * @return {Observable} observable，值由将每个源值投射的observable串行合并而成.
 * @method concatMapTo
 * @owner Observable
 */
export function concatMapTo<T, I, R>(this: Observable<T>, innerObservable: Observable<I>,
                                     resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): Observable<R> {
  return this.lift(new MergeMapToOperator(innerObservable, resultSelector, 1));
}
