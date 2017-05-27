import { CombineLatestOperator } from './combineLatest';
import { Observable } from '../Observable';

/**
 * 将高阶Observable转化为一阶Observable通过等待最外层的Observable完成,然后调用
 * {@link combineLatest}.
 *
 * <span class="informal">转化Observable-of-Observables通过调用
 * {@link combineLatest}当Observable-of-Observables完成的时候.</span>
 *
 * <img src="./img/combineAll.png" width="100%">
 *
 * 接受一个返回Observables的Observable, 收集所有Observables的值. 一旦最外层的
 * Observable完成, 会订阅所有收集的Observables然后通过{@link combineLatest}合并值,
 *  这样:
 * - 每次内部Observable发送的时候, 外层Observable发送.
 * - 当返回的observable发送的时候, 会发送所有最新的值:
 *   - 如果提供了投射函数, 会按顺序出入内部Observable的值, 投射函数的结果
 *     或被输出Observable发出.
 *   - 如果没有提供投射函数, 包含所有最新数据的数组会被输出Observable发出.
 *
 * @example <caption>将两个点击事件转化为有限间隔Observable, 通过调用combineAll</caption>
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
 * @param {function} [project] 可选的函数参数，将内部Observable发出的最新值映射为新的结果.
 * 函数顺序的接受内部Observable的值.
 * @return {Observable} 一个见最新的值投射或者组成数组的Observable.
 * @method combineAll
 * @owner Observable
 */
export function combineAll<T, R>(this: Observable<T>, project?: (...values: Array<any>) => R): Observable<R> {
  return this.lift(new CombineLatestOperator(project));
}
