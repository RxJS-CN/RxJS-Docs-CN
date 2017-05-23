import { CombineLatestOperator } from './combineLatest';
import { Observable } from '../Observable';

/**
 * 通过等待外部 Observable 完成然后应用 {@link combineLatest} ，将高阶 Observable 转化为一阶 Observable。
 *
 * <span class="informal">当高阶 Observable 完成时，通过使用 {@link combineLatest} 将其打平。</span>
 *
 * <img src="./img/combineAll.png" width="100%">
 *
 * 接受一个返回 Observables 的 Observable, 并从中收集所有的 Observables 。 一旦最外部的
 * Observable 完成, 会订阅所有收集的 Observables 然后通过{@link combineLatest}合并值,
 *  这样:
 * - 每次内部 Observable 发出的时候, 外部 Observable 也发出。
 * - 当返回的 observable 发出的时候, 它会通过如下方式发出所有最新的值：
 *   - 如果提供了｀project｀函数, 该函数会按内部 Observable 到达的顺序依次使用每个内部 Observable 的最新值进行调用。
 *   - 如果没有提供｀project｀函数, 包含所有最新数据的数组会被输出 Observable 发出。
 *
 * @example <caption>将两个点击事件映射为有限的 interval Observable，然后应用 combineAll</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var higherOrder = clicks.map(ev =>
 *   Rx.Observable.interval(Math.random()*2000).take(3)
 * ).take(2);
 * var result = higherOrder.combineAll();
 * result.subscribe(x => console.log(x));
 *
 * @see {@link combineLatest}
 * @see {@link mergeAll}
 *
 * @param {function} [project] 它按顺序的从每个收集到的内部 Observable 中接收最新值作为参数。
 * @return {Observable} 该 Observable 为最新值的投射结果或数组。
 * @method combineAll
 * @owner Observable
 */
export function combineAll<T, R>(this: Observable<T>, project?: (...values: Array<any>) => R): Observable<R> {
  return this.lift(new CombineLatestOperator(project));
}
