import { Observable } from '../Observable';
import { ReduceOperator } from './reduce';

/**
 * The Min operator operates on an Observable that emits numbers (or items that can be compared with a provided function),
 * and when source Observable completes it emits a single item: the item with the smallest value.
 * `min` 操作符操作的 Observable 发出数字(或可以使用提供函数进行比较的项)并且当源 Observable 完成时它发出单一项：最小值的项。
 *
 * <img src="./img/min.png" width="100%">
 *
 * @example <caption>获取一连串数字中的最小值</caption>
 * Rx.Observable.of(5, 4, 7, 2, 8)
 *   .min()
 *   .subscribe(x => console.log(x)); // -> 2
 *
 * @example <caption>使用比较函数来获取最小值的项</caption>
 * interface Person {
 *   age: number,
 *   name: string
 * }
 * Observable.of<Person>({age: 7, name: 'Foo'},
 *                       {age: 5, name: 'Bar'},
 *                       {age: 9, name: 'Beer'})
 *           .min<Person>( (a: Person, b: Person) => a.age < b.age ? -1 : 1)
 *           .subscribe((x: Person) => console.log(x.name)); // -> 'Bar'
 * }
 *
 * @see {@link max}
 *
 * @param {Function} [comparer] - 可选的比较函数，用它来替代默认值来比较两项的值。
 * @return {Observable<R>} 该 Observable 发出最小值的项。
 * @method min
 * @owner Observable
 */
export function min<T>(this: Observable<T>, comparer?: (x: T, y: T) => number): Observable<T> {
  const min: (x: T, y: T) => T = (typeof comparer === 'function')
    ? (x, y) => comparer(x, y) < 0 ? x : y
    : (x, y) => x < y ? x : y;
  return this.lift(new ReduceOperator(min));
}
