import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { ArgumentOutOfRangeError } from '../util/ArgumentOutOfRangeError';
import { EmptyObservable } from '../observable/EmptyObservable';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';

/**
 * 只发出源 Observable 最初发出的的N个值 (N = `count`)。
 *
 * <span class="informal">接收源 Observable 最初的N个值 (N = `count`)，然后完成。</span>
 *
 * <img src="./img/take.png" width="100%">
 *
 * `take` 返回的 Observable 只发出源 Observable 最初发出的的N个值 (N = `count`)。
 * 如果源发出值的数量小于 `count` 的话，那么它的所有值都将发出。然后它便完成，无论源 
 * Observable 是否完成。
 *
 * @example <caption>获取时间间隔为1秒的 interval Observable 的最初的5秒</caption>
 * var interval = Rx.Observable.interval(1000);
 * var five = interval.take(5);
 * five.subscribe(x => console.log(x));
 *
 * @see {@link takeLast}
 * @see {@link takeUntil}
 * @see {@link takeWhile}
 * @see {@link skip}
 *
 * @throws {ArgumentOutOfRangeError} 当使用 `take(i)` 时，如果 `i < 0`，
 * 它会发送 ArgumentOutOrRangeError 给观察者的 `error` 回调函数。
 *
 * @param {number} count 发出 `next` 通知的最大次数。
 * @return {Observable<T>} 该 Observable 只发出源 Observable 最初发出的的N个值 (N = `count`)，
 * 或者发出源 Observable 的所有值，如果源发出值的数量小于 `count` 的话。
 * @method take
 * @owner Observable
 */
export function take<T>(this: Observable<T>, count: number): Observable<T> {
  if (count === 0) {
    return new EmptyObservable<T>();
  } else {
    return this.lift(new TakeOperator(count));
  }
}

class TakeOperator<T> implements Operator<T, T> {
  constructor(private total: number) {
    if (this.total < 0) {
      throw new ArgumentOutOfRangeError;
    }
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new TakeSubscriber(subscriber, this.total));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class TakeSubscriber<T> extends Subscriber<T> {
  private count: number = 0;

  constructor(destination: Subscriber<T>, private total: number) {
    super(destination);
  }

  protected _next(value: T): void {
    const total = this.total;
    const count = ++this.count;
    if (count <= total) {
      this.destination.next(value);
      if (count === total) {
        this.destination.complete();
        this.unsubscribe();
      }
    }
  }
}
