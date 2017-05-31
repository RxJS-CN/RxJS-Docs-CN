import { MergeMapOperator } from './mergeMap';
import { Observable, ObservableInput } from '../Observable';

/* tslint:disable:max-line-length */
export function concatMap<T, R>(this: Observable<T>, project: (value: T, index: number) =>  ObservableInput<R>): Observable<R>;
export function concatMap<T, I, R>(this: Observable<T>, project: (value: T, index: number) =>  ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 将源值投射为一个合并到输出Observable的Observable,以串行的方式等待前一个完成再合并下一个
 * Observable.
 * <span class="informal">将每个值映射为Observable, 然后使用{@link concatAll}将所有的
 * 内部Observables打平.</span>
 *
 * <img src="./img/concatMap.png" width="100%">
 *
 * 返回一个Observable，该Observable发出基于对源Observable发出的值调用提供的函数, 
 * 该函数返回所谓的内部Observable. 每个新的内部Observable和前一个内部Observable连接在一起.
 *
 * __Warning:__ 如果源值不断的到达并且速度快于内部Observables完成的速度, 它会导致内存问题
 * 因为不断积累的内部Observable需要无界的缓冲区等待被订阅.
 *
 * Note: `concatMap` 和并行数为1的`mergeMap`效果一样.
 *
 * @example <caption>对于每个点击事件, 每秒发出从0到3的值, 串行地</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.concatMap(ev => Rx.Observable.interval(1000).take(4));
 * result.subscribe(x => console.log(x));
 *
 * // 结果如下:
 * // (结果是串行的)
 * // 对于"document"对象上的点击事件，它会发出从0到3的区间值每隔1秒
 * // one click = 1000ms-> 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3
 *
 * @see {@link concat}
 * @see {@link concatAll}
 * @see {@link concatMapTo}
 * @see {@link exhaustMap}
 * @see {@link mergeMap}
 * @see {@link switchMap}
 *
 * @param {function(value: T, ?index: number): ObservableInput} 投射函数, 
 * 用在源Observable发出的每个值上,返回Observable.
 * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]
 * A function to produce the value on the output Observable based on the values
 * and the indices of the source (outer) emission and the inner Observable
 * emission. The arguments passed to this function are:
 * - `outerValue`: the value that came from the source
 * - `innerValue`: the value that came from the projected Observable
 * - `outerIndex`: the "index" of the value that came from the source
 * - `innerIndex`: the "index" of the value from the projected Observable
 * @return {Observable} observable， 值由投射过的Observables串行被订阅合并而来.
 * 可选的,它们的值可以是传入的`projectResult`参数投射过的.
 * @return {Observable} Observable，发出对源Observable发出的每个值使用投射函数
 * (和可选的`resultSelector`)的结果并且顺序的取出每个投射过的内部Observable的值.
 * @method concatMap
 * @owner Observable
 */
export function concatMap<T, I, R>(this: Observable<T>, project: (value: T, index: number) =>  ObservableInput<I>,
                                   resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R) {
  return this.lift(new MergeMapOperator(project, resultSelector, 1));
}
