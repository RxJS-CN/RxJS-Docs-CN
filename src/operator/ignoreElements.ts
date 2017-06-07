import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { noop } from '../util/noop';

/**
 * 忽略源 Observable 所发送的所有项，只传递 `complete` 或 `error` 的调用。
 *
 * <img src="./img/ignoreElements.png" width="100%">
 *
 * @return {Observable} 该 Observable 是空的，只调用 `complete` 或 
 * `error`，调用是基于源 Observable 的调用。
 * @method ignoreElements
 * @owner Observable
 */
export function ignoreElements<T>(this: Observable<T>): Observable<T> {
  return this.lift(new IgnoreElementsOperator());
};

class IgnoreElementsOperator<T, R> implements Operator<T, R> {
  call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new IgnoreElementsSubscriber(subscriber));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class IgnoreElementsSubscriber<T> extends Subscriber<T> {
  protected _next(unused: T): void {
    noop();
  }
}
