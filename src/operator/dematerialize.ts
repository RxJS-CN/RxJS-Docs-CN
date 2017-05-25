import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Notification } from '../Notification';

/**
 * 将 {@link Notification} 对象的 Observable 转换成它们所代表的发送。
 *
 * <span class="informal">将 {@link Notification} 对象拆开成实际的 `next`、
 * `error` 和 `complete` 发送。它与 {@link materialize} 是相反的。</span>
 *
 * <img src="./img/dematerialize.png" width="100%">
 *
 * `dematerialize` 被假定为操作的 Observable 只会将 {@link Notification} 对象
 * 作为 `next` 发出，并且不会发出任何的 `error` 。这样的 Obseravble 其实是 `materialize`
 * 操作符的输出。然后这些通知会使用它们所包含的元数据进行拆解，并在输出 Observable 上
 * 发出 `next` 、`error` 和 `complete` 。
 *
 * 与 {@link materialize} 结合来使用此操作符。
 *
 * @example <caption>将 Notifications 的 Observable 转换成实际的 Observable</caption>
 * var notifA = new Rx.Notification('N', 'A');
 * var notifB = new Rx.Notification('N', 'B');
 * var notifE = new Rx.Notification('E', void 0,
 *   new TypeError('x.toUpperCase is not a function')
 * );
 * var materialized = Rx.Observable.of(notifA, notifB, notifE);
 * var upperCase = materialized.dematerialize();
 * upperCase.subscribe(x => console.log(x), e => console.error(e));
 *
 * // 结果：
 * // A
 * // B
 * // TypeError: x.toUpperCase is not a function
 *
 * @see {@link Notification}
 * @see {@link materialize}
 *
 * @return {Observable} Observable 会发出数据项和通知，它们是由源 Observable 所发出
 * 并且包装在 Notification 对象之中的。
 * @method dematerialize
 * @owner Observable
 */
export function dematerialize<T>(this: Observable<T>): Observable<any> {
  return this.lift(new DeMaterializeOperator());
}

class DeMaterializeOperator<T extends Notification<any>, R> implements Operator<T, R> {
  call(subscriber: Subscriber<any>, source: any): any {
    return source.subscribe(new DeMaterializeSubscriber(subscriber));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DeMaterializeSubscriber<T extends Notification<any>> extends Subscriber<T> {
  constructor(destination: Subscriber<any>) {
    super(destination);
  }

  protected _next(value: T) {
    value.observe(this.destination);
  }
}
