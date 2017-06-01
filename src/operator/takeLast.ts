import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { ArgumentOutOfRangeError } from '../util/ArgumentOutOfRangeError';
import { EmptyObservable } from '../observable/EmptyObservable';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';

/**
 * 只发出源 Observable 最后发出的的N个值 (N = `count`)。
 *
 * <span class="informal">记住源 Observable 的最后N个值 (N = `count`)，然后只有当
 * 它完成时发出这些值。</span>
 *
 * <img src="./img/takeLast.png" width="100%">
 *
 * `takeLast` 返回的 Observable 只发出源 Observable 最后发出的的N个值 (N = `count`)。
 * 如果源发出值的数量小于 `count` 的话，那么它的所有值都将发出。此操作符必须等待
 * 源 Observable 的 `complete` 通知发送才能在输出 Observable 上发出 `next` 值，
 * 因为不这样的话它无法知道源 Observable 上是否还有更多值要发出。出于这个原因，
 * 所有值都将同步发出，然后是 `complete` 通知。
 * 
 * @example <caption>获取有多个值的 Observable 的最后3个值</caption>
 * var many = Rx.Observable.range(1, 100);
 * var lastThree = many.takeLast(3);
 * lastThree.subscribe(x => console.log(x));
 *
 * @see {@link take}
 * @see {@link takeUntil}
 * @see {@link takeWhile}
 * @see {@link skip}
 *
 * @throws {ArgumentOutOfRangeError} 当使用 `takeLast(i)` 时，如果 `i < 0`，
 * 它会发送 ArgumentOutOrRangeError 给观察者的 `error` 回调函数。
 *
 * @param {number} count 从源 Observable 的值序列的末尾处，要发出的值的最大数量。
 * @return {Observable<T>} 该 Observable 只发出源 Observable 最后发出的的N个值 (N = `count`)，
 * 或者发出源 Observable 的所有值，如果源发出值的数量小于 `count` 的话。
 * @method takeLast
 * @owner Observable
 */
export function takeLast<T>(this: Observable<T>, count: number): Observable<T> {
  if (count === 0) {
    return new EmptyObservable<T>();
  } else {
    return this.lift(new TakeLastOperator(count));
  }
}

class TakeLastOperator<T> implements Operator<T, T> {
  constructor(private total: number) {
    if (this.total < 0) {
      throw new ArgumentOutOfRangeError;
    }
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new TakeLastSubscriber(subscriber, this.total));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class TakeLastSubscriber<T> extends Subscriber<T> {
  private ring: Array<T> = new Array();
  private count: number = 0;

  constructor(destination: Subscriber<T>, private total: number) {
    super(destination);
  }

  protected _next(value: T): void {
    const ring = this.ring;
    const total = this.total;
    const count = this.count++;

    if (ring.length < total) {
      ring.push(value);
    } else {
      const index = count % total;
      ring[index] = value;
    }
  }

  protected _complete(): void {
    const destination = this.destination;
    let count = this.count;

    if (count > 0) {
      const total = this.count >= this.total ? this.total : this.count;
      const ring  = this.ring;

      for (let i = 0; i < total; i++) {
        const idx = (count++) % total;
        destination.next(ring[idx]);
      }
    }

    destination.complete();
  }
}
