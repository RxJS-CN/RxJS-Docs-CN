import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { TeardownLogic } from '../Subscription';

/**
 * 返回一个 Observable， 该 Observable 忽略所有源 Observable 发出并且使得指定条件为 true 的数据项, 
 * 但是会发出所有源 Observable 发出并且使得指定条件为 false 的数据项。
 *
 * <img src="./img/skipWhile.png" width="100%">
 *
 * @param {Function} predicate - 用来测试源 Observable 发出的每个数据项。
 * @return {Observable<T>} Observable， 该 Observable 开始发出源 Observable 发出的数据，当该数据使得
 * 制定条件为 false。
 * @method skipWhile
 * @owner Observable
 */
export function skipWhile<T>(this: Observable<T>, predicate: (value: T, index: number) => boolean): Observable<T> {
  return this.lift(new SkipWhileOperator(predicate));
}

class SkipWhileOperator<T> implements Operator<T, T> {
  constructor(private predicate: (value: T, index: number) => boolean) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new SkipWhileSubscriber(subscriber, this.predicate));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SkipWhileSubscriber<T> extends Subscriber<T> {
  private skipping: boolean = true;
  private index: number = 0;

  constructor(destination: Subscriber<T>,
              private predicate: (value: T, index: number) => boolean) {
    super(destination);
  }

  protected _next(value: T): void {
    const destination = this.destination;
    if (this.skipping) {
      this.tryCallPredicate(value);
    }

    if (!this.skipping) {
      destination.next(value);
    }
  }

  private tryCallPredicate(value: T): void {
    try {
      const result = this.predicate(value, this.index++);
      this.skipping = Boolean(result);
    } catch (err) {
      this.destination.error(err);
    }
  }
}
