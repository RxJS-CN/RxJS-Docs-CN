import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { TeardownLogic } from '../Subscription';

/**
 * 返回一个 Observable， 该 Observable 会跳过由源 Observable 发出的所有满足指定条件的数据项， 
 * 但是一旦出现了不满足条件的项，则发出在此之后的所有项。
 *
 * <img src="./img/skipWhile.png" width="100%">
 *
 * @param {Function} predicate - 函数，用来测试源 Observable 发出的每个数据项。
 * @return {Observable<T>} Observable，当指定的 predicate 函数返回 false 时，该 Observable 开始发出由源 Observable 发出的项。
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
