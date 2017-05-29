import { Observable } from '../Observable';
import { ReduceOperator } from './reduce';

/**
 * `max` 操作符操作的 Observable 发出数字(或可以与提供的函数进行比较的项)并且当源 Observable 完成时它发出单一项：最大值的项。
 *
 * <img src="./img/max.png" width="100%">
 *
 * @example <caption>获取一连串数字中的最大值</caption>
 * Rx.Observable.of(5, 4, 7, 2, 8)
 *   .max()
 *   .subscribe(x => console.log(x)); // -> 8
 *
 * @example <caption>使用比较函数来获取最大值的项</caption>
 * interface Person {
 *   age: number,
 *   name: string
 * }
 * Observable.of<Person>({age: 7, name: 'Foo'},
 *                       {age: 5, name: 'Bar'},
 *                       {age: 9, name: 'Beer'})
 *           .max<Person>((a: Person, b: Person) => a.age < b.age ? -1 : 1)
 *           .subscribe((x: Person) => console.log(x.name)); // -> 'Beer'
 * }
 *
 * @see {@link min}
 *
 * @param {Function} [comparer] - 可选的比较函数，用它来替代默认值来比较两项的值。
 * @return {Observable} 该 Observable 发出最大值的项。
 * @method max
 * @owner Observable
 */
export function max<T>(this: Observable<T>, comparer?: (x: T, y: T) => number): Observable<T> {
  const max: (x: T, y: T) => T = (typeof comparer === 'function')
    ? (x, y) => comparer(x, y) > 0 ? x : y
    : (x, y) => x > y ? x : y;
  return this.lift(new ReduceOperator(max));
}
