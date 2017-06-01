import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';

/**
 * 返回一个 Observable, 该 Observable跳过源 Observable 发出的前几个值.
 *
 * <img src="./img/skip.png" width="100%">
 *
 * @param {Number} count - 次数, 源 Observable 发出应该被跳过的.
 * @return {Observable} 跳过源 Observable 发出值的 Observable.
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
