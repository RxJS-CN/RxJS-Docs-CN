import { not } from '../util/not';
import { filter } from './filter';
import { Observable } from '../Observable';

/**
 * 将源 Observable 一分为二，一个是所有满足 predicate 函数的值，另一个是所有
 * 不满足 predicate 的值。
 *
 * <span class="informal">它很像 {@link filter}，但是返回两个 Observables ：
 * 一个像 {@link filter} 的输出， 而另一个是所有不符合条件的值。</span>
 *
 * <img src="./img/partition.png" width="100%">
 * 
 * `partition` 输出有两个 Observables 的数组，这两个 Observables 是通过给定的 `predicate` 
 * 函数将源 Observable 的值进行划分得到的。该数组的第一个 Observable 发出 predicate 参数
 * 返回 true 的源值。第二个 Observable 发出 predicate 参数返回 false 的源值。第一个像是 
 * {@link filter} ，而第二个像是 predicate 取反的 {@link filter} 。
 *
 * @example <caption>将点击事件划分为点击 DIV 元素和点击其他元素</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var parts = clicks.partition(ev => ev.target.tagName === 'DIV');
 * var clicksOnDivs = parts[0];
 * var clicksElsewhere = parts[1];
 * clicksOnDivs.subscribe(x => console.log('DIV clicked: ', x));
 * clicksElsewhere.subscribe(x => console.log('Other clicked: ', x));
 *
 * @see {@link filter}
 *
 * @param {function(value: T, index: number): boolean} predicate 评估源 Observable 
 * 所发出的每个值的函数。如果它返回 `true` ，那么发出的值就在返回的数组中的第一个 
 * Observable 中，如果返回的是 `false` ，那么发出的值就在返回的数组的第二个 
 * Observable 中。`index` 参数是自订阅开始后发送序列的索引，是从 `0` 开始的。
 * @param {any} [thisArg] 可选参数，用来决定 `predicate` 函数中的 `this` 的值。
 * @return {[Observable<T>, Observable<T>]} 有两个 Observables 的数组：
 * 一个是通过 predicate 函数的所有值，另一个是没有通过 predicate 的所有值。
 * @method partition
 * @owner Observable
 */
export function partition<T>(this: Observable<T>, predicate: (value: T) => boolean, thisArg?: any): [Observable<T>, Observable<T>] {
  return [
    filter.call(this, predicate, thisArg),
    filter.call(this, not(predicate, thisArg))
  ];
}
