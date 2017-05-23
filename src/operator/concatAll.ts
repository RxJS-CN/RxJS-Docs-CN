import { Observable } from '../Observable';
import { Subscribable } from '../Observable';
import { MergeAllOperator } from './mergeAll';

/* tslint:disable:max-line-length */
export function concatAll<T>(this: Observable<T>): T;
export function concatAll<T, R>(this: Observable<T>): Subscribable<R>;
/* tslint:enable:max-line-length */

/**
 * 通过顺序地连接内部 Observable，将高阶 Observable 转化为一阶 Observable 。
 * 
 * <span class="informal">通过一个接一个的连接内部 Observable ，将高阶 Observable 打平。</span>
 *
 * <img src="./img/concatAll.png" width="100%">
 *
 * 串行连接源(高阶 Observable)所发出的每个 Observable，只有当一个内部 Observable 完成的时候才订阅下
 * 一个内部 Observable，并将它们的所有值合并到返回的 Observable 中。
 *
 * 警告: 如果源 Observable 很快并且不停的发送 Observables, 内部 Observables 发送的完成
 * 通知比源 Observable 慢, 你会遇到内存问题，因为传入的 Observables 在无界缓冲区中收集.
 *
 * 注意: concatAll 等价于 concurrency 参数(最大并发数)为1的 mergeAll 。
 *
 * @example <caption>每次点击都会触发从0到3的定时器(时间间隔为1秒)，定时器之间是串行的</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var higherOrder = clicks.map(ev => Rx.Observable.interval(1000).take(4));
 * var firstOrder = higherOrder.concatAll();
 * firstOrder.subscribe(x => console.log(x));
 *
 * // 结果如下:
 * // (结果是串行的)
 * // 对于"document"对象上的点击事件，都会以1秒的间隔发出从0到3的值
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
 * @return {Observable} Observable，该 Observable 串联地发出所有内部 Observables 的值。
 * @method concatAll
 * @owner Observable
 */
export function concatAll<T>(this: Observable<T>): T {
  return <any>this.lift<any>(new MergeAllOperator<T>(1));
}
