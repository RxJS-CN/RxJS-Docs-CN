import { Observable } from '../Observable';
import { FindValueOperator } from './find';

/**
 * 只发出源 Observable 所发出的值中第一个满足条件的值的索引。
 *
 * <span class="informal">它很像 {@link find} , 但发出的是找到的值的索引，
 * 而不是值本身。</span>
 *
 * <img src="./img/findIndex.png" width="100%">
 *
 * `findIndex` 会查找源 Observable 中与 `predicate` 函数体现的指定条件匹配的第一项，然后
 * 返回其索引(从0开始)。不同于 {@link first}，在 `findIndex` 中 `predicate` 是必须的，而且如果没找到
 * 有效的值的话也不会发出错误。
 *
 * @example <caption>找到并发出第一个点击 DIV 元素的事件的索引</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.findIndex(ev => ev.target.tagName === 'DIV');
 * result.subscribe(x => console.log(x));
 *
 * @see {@link filter}
 * @see {@link find}
 * @see {@link first}
 * @see {@link take}
 *
 * @param {function(value: T, index: number, source: Observable<T>): boolean} predicate
 * 使用每项来调用的函数，用于测试是否符合条件。
 * @param {any} [thisArg] 可选参数，用来决定 `predicate` 函数中的 `this` 的值。
 * @return {Observable<T>} 符合条件的第一项的索引的 Observable 。
 * @method find
 * @owner Observable
 */
export function findIndex<T>(this: Observable<T>, predicate: (value: T, index: number, source: Observable<T>) => boolean,
                             thisArg?: any): Observable<number> {
  return <any>this.lift<any>(new FindValueOperator(predicate, this, true, thisArg));
}
