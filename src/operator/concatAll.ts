import { Observable } from '../Observable';
import { Subscribable } from '../Observable';
import { MergeAllOperator } from './mergeAll';

/* tslint:disable:max-line-length */
export function concatAll<T>(this: Observable<T>): T;
export function concatAll<T, R>(this: Observable<T>): Subscribable<R>;
/* tslint:enable:max-line-length */

/**
 * 将一个高阶Observable转化为一阶Observable通过顺序的连接内部的Observables.
 *
 * <span class="informal">将Observable-of-Observables转化成一个Observable接
 * 一个Observable.</span>
 *
 * <img src="./img/concatAll.png" width="100%">
 *
 * 串行连接源Observable发送的所有Observable. 当前一个内部Observable完成的时候订阅下一个内部
 * Observable, 将它们所有的值合并到返回的observable.
 *
 * __Warning:__ 如果源Observable很快并且不停的发送Observables, 内部Observables发送的完成
 * 通知比源Observable慢, 你会遇到内存问题当传入的Observables在无界缓冲区中收集.
 *
 * 注意: `concatAll`和并行数位1的`mergeAll`效果一样.
 *
 * @example <caption>For each click event, tick every second from 0 to 3, with no concurrency</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var higherOrder = clicks.map(ev => Rx.Observable.interval(1000).take(4));
 * var firstOrder = higherOrder.concatAll();
 * firstOrder.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // (results are not concurrent)
 * // For every click on the "document" it will emit values 0 to 3 spaced
 * // on a 1000ms interval
 * // one click = 1000ms-> 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3
 *
 * @see {@link combineAll}
 * @see {@link concat}
 * @see {@link concatMap}
 * @see {@link concatMapTo}
 * @see {@link exhaust}
 * @see {@link mergeAll}
 * @see {@link switch}
 * @see {@link zipAll}
 *
 * @return {Observable} An Observable emitting values from all the inner
 * Observables concatenated.
 * @method concatAll
 * @owner Observable
 */
export function concatAll<T>(this: Observable<T>): T {
  return <any>this.lift<any>(new MergeAllOperator<T>(1));
}
