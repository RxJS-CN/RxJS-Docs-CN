import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { ArgumentOutOfRangeError } from '../util/ArgumentOutOfRangeError';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';

/**
 * 跳过最后 `count` 个由源 Observable 发出的值。
 *
 * <img src="./img/skipLast.png" width="100%">
 *
 * `skipLast` 返回一个 Observable，该 Observable 累积足够长的队列以存储第一个“计数”值。 
 * 当接收到更多值时，将从队列的前面取值并在结果序列上产生。 这种情况下值会被延时。
 *
 * @example <caption>跳过最后两个值</caption>
 * var many = Rx.Observable.range(1, 5);
 * var skipLastTwo = many.skipLast(2);
 * skipLastTwo.subscribe(x => console.log(x));
 *
 * // Results in:
 * // 1 2 3
 *
 * @see {@link skip}
 * @see {@link skipUntil}
 * @see {@link skipWhile}
 * @see {@link take}
 *
 * @throws {ArgumentOutOfRangeError} 当使用 `skipLast(i)`, 如果`i < 0`
 * 抛出 ArgumentOutOrRangeError 。
 *
 * @param {number} count 源 Observable 中从后往前要跳过的值。
 * @returns {Observable<T>} Observable，该 Observable 跳过源 Observable最后发出
 * 的最后几个值。
 * @method skipLast
 * @owner Observable
 */
export function skipLast<T>(this: Observable<T>, count: number): Observable<T> {
  return this.lift(new SkipLastOperator(count));
}

class SkipLastOperator<T> implements Operator<T, T> {
  constructor(private _skipCount: number) {
    if (this._skipCount < 0) {
      throw new ArgumentOutOfRangeError;
    }
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    if (this._skipCount === 0) {
      // If we don't want to skip any values then just subscribe
      // to Subscriber without any further logic.
      return source.subscribe(new Subscriber(subscriber));
    } else {
      return source.subscribe(new SkipLastSubscriber(subscriber, this._skipCount));
    }
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SkipLastSubscriber<T> extends Subscriber<T> {
  private _ring: T[];
  private _count: number = 0;

  constructor(destination: Subscriber<T>, private _skipCount: number) {
    super(destination);
    this._ring = new Array<T>(_skipCount);
  }

  protected _next(value: T): void {
    const skipCount = this._skipCount;
    const count = this._count++;

    if (count < skipCount) {
      this._ring[count] = value;
    } else {
      const currentIndex = count % skipCount;
      const ring = this._ring;
      const oldValue = ring[currentIndex];

      ring[currentIndex] = value;
      this.destination.next(oldValue);
    }
  }
}