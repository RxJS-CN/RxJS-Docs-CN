import { distinctUntilChanged } from './distinctUntilChanged';
import { Observable } from '../Observable';

/* tslint:disable:max-line-length */
export function distinctUntilKeyChanged<T>(this: Observable<T>, key: string): Observable<T>;
export function distinctUntilKeyChanged<T, K>(this: Observable<T>, key: string, compare: (x: K, y: K) => boolean): Observable<T>;
/* tslint:enable:max-line-length */

/**
 * 返回 Observable，它发出源 Observable 发出的所有与前一项不相同的项，使用通过提供的 key 访问到的属性来检查两个项是否不同。
 *
 * 如果提供了 compare 函数，那么每一项都会调用它来检验是否应该发出这个值。
 *
 * 如果没有提供 compare 函数，默认使用相等检查。
 *
 * @example <caption>比较人名的示例</caption>
 *
 *  interface Person {
 *     age: number,
 *     name: string
 *  }
 *
 * Observable.of<Person>(
 *     { age: 4, name: 'Foo'},
 *     { age: 7, name: 'Bar'},
 *     { age: 5, name: 'Foo'},
 *     { age: 6, name: 'Foo'})
 *     .distinctUntilKeyChanged('name')
 *     .subscribe(x => console.log(x));
 *
 * // 显示：
 * // { age: 4, name: 'Foo' }
 * // { age: 7, name: 'Bar' }
 * // { age: 5, name: 'Foo' }
 *
 * @example <caption>比较名字前三个字母的示例</caption>
 *
 * interface Person {
 *     age: number,
 *     name: string
 *  }
 *
 * Observable.of<Person>(
 *     { age: 4, name: 'Foo1'},
 *     { age: 7, name: 'Bar'},
 *     { age: 5, name: 'Foo2'},
 *     { age: 6, name: 'Foo3'})
 *     .distinctUntilKeyChanged('name', (x: string, y: string) => x.substring(0, 3) === y.substring(0, 3))
 *     .subscribe(x => console.log(x));
 *
 * // 显示：
 * // { age: 4, name: 'Foo1' }
 * // { age: 7, name: 'Bar' }
 * // { age: 5, name: 'Foo2' }
 *
 * @see {@link distinct}
 * @see {@link distinctUntilChanged}
 *
 * @param {string} key 每项中用于查找对象属性的字符串键。
 * @param {function} [compare] 可选比较函数，用来检验当前项与源中的前一项是否相同。
 * @return {Observable} 该 Observable 发出从源 Observable 中基于指定的 key 得到与前一项不同的值。
 * @method distinctUntilKeyChanged
 * @owner Observable
 */
export function distinctUntilKeyChanged<T>(this: Observable<T>, key: string, compare?: (x: T, y: T) => boolean): Observable<T> {
  return distinctUntilChanged.call(this, function(x: T, y: T) {
    if (compare) {
      return compare(x[key], y[key]);
    }
    return x[key] === y[key];
  });
}
