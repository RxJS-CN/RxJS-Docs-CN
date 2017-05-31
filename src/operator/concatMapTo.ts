import { Observable, ObservableInput } from '../Observable';
import { MergeMapToOperator } from './mergeMapTo';

/* tslint:disable:max-line-length */
export function concatMapTo<T, R>(this: Observable<T>, observable: ObservableInput<R>): Observable<R>;
export function concatMapTo<T, I, R>(this: Observable<T>, observable: ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 将源值投射为同一个Observable，该Observable被用来串行的合并到输出Observable上多次.
 *
 * <span class="informal">就像是{@link concatMap}, 但是将每个值映射为同一个内部Observable.</span>
 *
 * <img src="./img/concatMapTo.png" width="100%">
 *
 * 不管源值是多少都将其映射为给定的`innerObservable`, 然后将其打平为单个Observable,也就
 * 是所谓的输出Observable. 每个新的`innerObservable`实例和前一个`innerObservable`相连
 * 接的时候就可以对输出Observable进行发送.
 *
 * __Warning:__ 如果源值不断的到达并且速度快于内部Observables完成的速度, 它会导致内存问题
 * 因为不断积累的内部Observable需要无界的缓冲区等待被订阅.
 *
 * Note: `concatMapTo` is equivalent to `mergeMapTo` with concurrency parameter
 * set to `1`.
 *
 * @example <caption>对于每个点击事件, 每秒发送0到3的数值, 串行</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.concatMapTo(Rx.Observable.interval(1000).take(4));
 * result.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // (results are not concurrent)
 * // For every click on the "document" it will emit values 0 to 3 spaced
 * // on a 1000ms interval
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
 * A function to produce the value on the output Observable based on the values
 * and the indices of the source (outer) emission and the inner Observable
 * emission. The arguments passed to this function are:
 * - `outerValue`: the value that came from the source
 * - `innerValue`: the value that came from the projected Observable
 * - `outerIndex`: the "index" of the value that came from the source
 * - `innerIndex`: the "index" of the value from the projected Observable
 * @return {Observable} observable，值由将每个源值投射的observable串行合并而成.
 * @method concatMapTo
 * @owner Observable
 */
export function concatMapTo<T, I, R>(this: Observable<T>, innerObservable: Observable<I>,
                                     resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): Observable<R> {
  return this.lift(new MergeMapToOperator(innerObservable, resultSelector, 1));
}
