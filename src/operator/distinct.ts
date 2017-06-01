import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { TeardownLogic } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';
import { ISet, Set } from '../util/Set';

/**
 * 返回 Observable，它发出由源 Observable 所发出的所有与之前所有项都不相同的项。
 * 
 * 如果提供了 keySelector 函数，那么它会将源 Observable 的每个值都投射成一个新的值，这个值会用来检查是否与先前投射的值相等。如果没有提供 
 * keySelector 函数，它会直接使用源 Observable 的每个值来检查是否与先前的值相等。
 *
 * 在支持 `Set` 的 JavaScript 运行时中，此操作符会使用 `Set` 来提升不同值检查的性能。
 *
 * 在其他运行时中，此操作符会使用 `Set` 的最小化实现，此实现在底层依赖于 `Array` 和 `indexOf`，因为要检查更多的值来进行区分，所以性能会降低。
 * 即使是在新浏览器中，长时间运行的 `distinct` 操作也可能会导致内存泄露。为了在某种场景下来缓解这个问题，可以提供一个可选的 `flushes` 参数，
 * 这样内部的 `Set` 可以被“清空”，基本上清除了它的所有值。
 *
 * @example <caption>使用数字的简单示例</caption>
 * Observable.of(1, 1, 2, 2, 2, 1, 2, 3, 4, 3, 2, 1)
 *   .distinct()
 *   .subscribe(x => console.log(x)); // 1, 2, 3, 4
 *
 * @example <caption>使用 keySelector 函数的示例</caption>
 * interface Person {
 *    age: number,
 *    name: string
 * }
 *
 * Observable.of<Person>(
 *     { age: 4, name: 'Foo'},
 *     { age: 7, name: 'Bar'},
 *     { age: 5, name: 'Foo'})
 *     .distinct((p: Person) => p.name)
 *     .subscribe(x => console.log(x));
 *
 * // 显示：
 * // { age: 4, name: 'Foo' }
 * // { age: 7, name: 'Bar' }
 *
 * @see {@link distinctUntilChanged}
 * @see {@link distinctUntilKeyChanged}
 *
 * @param {function} [keySelector] 可选函数，用来选择要检查哪个值是不同的。
 * @param {Observable} [flushes] 可选 Observable，用来清空操作符内部的 HashSet 。
 * @return {Observable} 该 Observable 发出从源 Observable 中得到的不同的值。
 * @method distinct
 * @owner Observable
 */
export function distinct<T, K>(this: Observable<T>,
                               keySelector?: (value: T) => K,
                               flushes?: Observable<any>): Observable<T> {
  return this.lift(new DistinctOperator(keySelector, flushes));
}

class DistinctOperator<T, K> implements Operator<T, T> {
  constructor(private keySelector: (value: T) => K, private flushes: Observable<any>) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new DistinctSubscriber(subscriber, this.keySelector, this.flushes));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class DistinctSubscriber<T, K> extends OuterSubscriber<T, T> {
  private values: ISet<K> = new Set<K>();

  constructor(destination: Subscriber<T>, private keySelector: (value: T) => K, flushes: Observable<any>) {
    super(destination);

    if (flushes) {
      this.add(subscribeToResult(this, flushes));
    }
  }

  notifyNext(outerValue: T, innerValue: T,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, T>): void {
    this.values.clear();
  }

  notifyError(error: any, innerSub: InnerSubscriber<T, T>): void {
    this._error(error);
  }

  protected _next(value: T): void {
    if (this.keySelector) {
      this._useKeySelector(value);
    } else {
      this._finalizeNext(value, value);
    }
  }

  private _useKeySelector(value: T): void {
    let key: K;
    const { destination } = this;
    try {
      key = this.keySelector(value);
    } catch (err) {
      destination.error(err);
      return;
    }
    this._finalizeNext(key, value);
  }

  private _finalizeNext(key: K|T, value: T) {
    const { values } = this;
    if (!values.has(<K>key)) {
      values.add(<K>key);
      this.destination.next(value);
    }
  }

}
