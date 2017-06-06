import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';

/* tslint:disable:max-line-length */
export function distinctUntilChanged<T>(this: Observable<T>, compare?: (x: T, y: T) => boolean): Observable<T>;
export function distinctUntilChanged<T, K>(this: Observable<T>, compare: (x: K, y: K) => boolean, keySelector: (x: T) => K): Observable<T>;
/* tslint:enable:max-line-length */

/**
 * 返回 Observable，它发出源 Observable 发出的所有与前一项不相同的项。
 *
 * 如果提供了 compare 函数，那么每一项都会调用它来检验是否应该发出这个值。
 *
 * 如果没有提供 compare 函数，默认使用相等检查。
 *
 * @example <caption>使用数字的简单示例</caption>
 * Observable.of(1, 1, 2, 2, 2, 1, 1, 2, 3, 3, 4)
 *   .distinctUntilChanged()
 *   .subscribe(x => console.log(x)); // 1, 2, 1, 2, 3, 4
 *
 * @example <caption>使用 compare 函数的示例</caption>
 * interface Person {
 *    age: number,
 *    name: string
 * }
 *
 * Observable.of<Person>(
 *     { age: 4, name: 'Foo'},
 *     { age: 7, name: 'Bar'},
 *     { age: 5, name: 'Foo'})
 *     { age: 6, name: 'Foo'})
 *     .distinctUntilChanged((p: Person, q: Person) => p.name === q.name)
 *     .subscribe(x => console.log(x));
 *
 * // 显示：
 * // { age: 4, name: 'Foo' }
 * // { age: 7, name: 'Bar' }
 * // { age: 5, name: 'Foo' }
 *
 * @see {@link distinct}
 * @see {@link distinctUntilKeyChanged}
 *
 * @param {function} [compare] 可选比较函数，用来检验当前项与源中的前一项是否相同。
 * @return {Observable} 该 Observable 发出从源 Observable 中得到的与前一项不同的值。
 * @method distinctUntilChanged
 * @owner Observable
 */
export function distinctUntilChanged<T, K>(this: Observable<T>, compare?: (x: K, y: K) => boolean, keySelector?: (x: T) => K): Observable<T> {
  return this.lift(new DistinctUntilChangedOperator<T, K>(compare, keySelector));
}

class DistinctUntilChangedOperator<T, K> implements Operator<T, T> {
  constructor(private compare: (x: K, y: K) => boolean,
              private keySelector: (x: T) => K) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new DistinctUntilChangedSubscriber(subscriber, this.compare, this.keySelector));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DistinctUntilChangedSubscriber<T, K> extends Subscriber<T> {
  private key: K;
  private hasKey: boolean = false;

  constructor(destination: Subscriber<T>,
              compare: (x: K, y: K) => boolean,
              private keySelector: (x: T) => K) {
    super(destination);
    if (typeof compare === 'function') {
      this.compare = compare;
    }
  }

  private compare(x: any, y: any): boolean {
    return x === y;
  }

  protected _next(value: T): void {

    const keySelector = this.keySelector;
    let key: any = value;

    if (keySelector) {
      key = tryCatch(this.keySelector)(value);
      if (key === errorObject) {
        return this.destination.error(errorObject.e);
      }
    }

    let result: any = false;

    if (this.hasKey) {
      result = tryCatch(this.compare)(this.key, key);
      if (result === errorObject) {
        return this.destination.error(errorObject.e);
      }
    } else {
      this.hasKey = true;
    }

    if (Boolean(result) === false) {
      this.key = key;
      this.destination.next(value);
    }
  }
}
