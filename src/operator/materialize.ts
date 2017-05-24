import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Notification } from '../Notification';

/**
 * 表示源 Observable 中的所有通知，每个通知都会在 {@link Notification} 对象中标记为
 * 它们原始的通知类型，并会作为输出 Observable 的 `next` 通知。
 *
 * <span class="informal">在 {@link Notification} 对象中包装 `next`、`error` 
 * 和 `complete` 发送, 并在输出 Observable 上作为 `next` 发送出去。
 * </span>
 *
 * <img src="./img/materialize.png" width="100%">
 *
 * `materialize` 返回一个 Observable，这个 Observable 会为每个源 Observable 的
 * `next`、`error` 或 `complete` 通知发出 `next` 通知。当源 Observable 发出 `complete` 时，
 * 输出 Observable 会发出 `next` 并且 Notification 类型为 "complete"，然后它也发出 
 * `complete` 。当源 Observable 发出 `error` 时，输出 Observable 会发出 `next` 并且
 * Notification 类型为 "error"，然后发出 `complete` 。
 * 
 * 该操作符对于生成源 Observable 的元数据很有用，并作为 `next` 发送使用掉。
 * 与 {@link dematerialize} 结合使用。
 *
 * @example <caption>将一个错误的 Observable 转换成 Notifications 的 Observable</caption>
 * var letters = Rx.Observable.of('a', 'b', 13, 'd');
 * var upperCase = letters.map(x => x.toUpperCase());
 * var materialized = upperCase.materialize();
 * materialized.subscribe(x => console.log(x));
 *
 * // 结果如下：
 * // - Notification {kind: "N", value: "A", error: undefined, hasValue: true}
 * // - Notification {kind: "N", value: "B", error: undefined, hasValue: true}
 * // - Notification {kind: "E", value: undefined, error: TypeError:
 * //   x.toUpperCase is not a function at MapSubscriber.letters.map.x
 * //   [as project] (http://1…, hasValue: false}
 *
 * @see {@link Notification}
 * @see {@link dematerialize}
 *
 * @return {Observable<Notification<T>>} Observable 会发出 {@link Notification} 对象，
 * 该对象包装了来自源 Observable 的带有元数据的原始通知。
 * @method materialize
 * @owner Observable
 */
export function materialize<T>(this: Observable<T>): Observable<Notification<T>> {
  return this.lift(new MaterializeOperator());
}

class MaterializeOperator<T> implements Operator<T, Notification<T>> {
  call(subscriber: Subscriber<Notification<T>>, source: any): any {
    return source.subscribe(new MaterializeSubscriber(subscriber));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class MaterializeSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<Notification<T>>) {
    super(destination);
  }

  protected _next(value: T) {
    this.destination.next(Notification.createNext(value));
  }

  protected _error(err: any) {
    const destination = this.destination;
    destination.next(Notification.createError(err));
    destination.complete();
  }

  protected _complete() {
    const destination = this.destination;
    destination.next(Notification.createComplete());
    destination.complete();
  }
}
