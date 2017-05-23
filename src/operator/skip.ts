import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';

/**
 * 返回一个 Observable， 该 Observable 跳过源 Observable 发出的前N个值(N = count)。
 *
 * <img src="./img/skip.png" width="100%">
 *
 * @param {Number} count - 由源 Observable 所发出项应该被跳过的次数。
 * @return {Observable} 跳过源 Observable 发出值的 Observable。
 *
 * @method skip
 * @owner Observable
 */
export function skip<T>(this: Observable<T>, count: number): Observable<T> {
  return this.lift(new SkipOperator(count));
}

class SkipOperator<T> implements Operator<T, T> {
  constructor(private total: number) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new SkipSubscriber(subscriber, this.total));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SkipSubscriber<T> extends Subscriber<T> {
  count: number = 0;

  constructor(destination: Subscriber<T>, private total: number) {
    super(destination);
  }

  protected _next(x: T) {
    if (++this.count > this.total) {
      this.destination.next(x);
    }
  }
}
